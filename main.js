import './style.css';

const template = `
<svg id="field" viewBox="0 0 400 300">
  <circle class="player" id="player1" cx="25" cy="200" r="25" />
  <circle class="ball" id="ball" cx="25" cy="200" r="10" />
  <circle class="player" id="player2" cx="250" cy="150" r="25" />
  <circle class="player" id="player3" cx="25" cy="25" r="25" />
  <path
    id="path"
    d="M 0,0
        l 100,150
        l 0,0
        l 150,0
        l0,0"
  />
</svg>
`;

document.body.innerHTML = template;

const [svgField, player1, player2, player3, path] =
  `field player1 player2 player3 path`
    .replace(/,/g, '')
    .split(' ')
    .map((s) => document.getElementById(s));

const svgRect = svgField.getBoundingClientRect();
let animationFrameId = null;
let speed = 1;

function getGoalPosition({ clientX, clientY }) {
  const x = clientX - svgRect.left;
  const y = clientY - svgRect.top;
  const viewBoxX =
    (x / svgRect.width) * svgField.viewBox.baseVal.width +
    svgField.viewBox.baseVal.x;
  const viewBoxY =
    (y / svgRect.height) * svgField.viewBox.baseVal.height +
    svgField.viewBox.baseVal.y;
  console.log(`Mouse position within viewBox: (${viewBoxX}, ${viewBoxY})`);

  return { x: viewBoxX, y: viewBoxY };
}

function createFrameFunc({ startTime, duration, onTick, onFinish }) {
  return ({ currentTime, id }) => {
    const progress = (currentTime - startTime) / duration;

    if (progress >= 1) {
      return onFinish?.(() => removeTickFunc(id));
    }
    return onTick({ progress, id });
  };
}

function getBodyPosition(player) {
  return {
    x: parseFloat(player.getAttribute('cx')),
    y: parseFloat(player.getAttribute('cy')),
  };
}

function distance(start, goal) {
  start = start instanceof Element ? getBodyPosition(start) : start;
  goal = goal instanceof Element ? getBodyPosition(goal) : goal;
  return Math.sqrt((goal.x - start.x) ** 2 + (goal.y - start.y) ** 2);
}

const tickFunctions = {};
const addTickFunc = (fn) => {
  tickFunctions[Date.now() + Math.round(Math.random() * 1000)] = fn;
};
const removeTickFunc = (id) => {
  delete tickFunctions[id];
};

function start() {
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(tick);
}

function tick(currentTime) {
  Object.entries(tickFunctions).forEach(([id, fn]) => fn({ currentTime, id }));

  animationFrameId = requestAnimationFrame(tick);
}

const keyDict = {};

document.addEventListener('keydown', ({ code }) => {
  keyDict[code] = true;
});

document.addEventListener('keyup', ({ code }) => {
  delete keyDict[code];
});

function moveToPoint(body, goal, moreTick) {
  const start = getBodyPosition(body);
  const dist = distance(start, goal);
  const duration = dist / (speed * 0.1);
  const startTime = performance.now();

  return createFrameFunc({
    startTime,
    duration,
    onTick: ({ progress }) => {
      const x = start.x + (goal.x - start.x) * progress;
      const y = start.y + (goal.y - start.y) * progress;
      body.setAttribute('cx', x);
      body.setAttribute('cy', y);
      moreTick?.({ progress });
    },
    onFinish: (removeFunc) => {
      body.setAttribute('cx', goal.x);
      body.setAttribute('cy', goal.y);
      removeFunc();
      return;
    },
  });
}

function startPlayer1(clickEvent) {
  const goal = getGoalPosition(clickEvent);
  return moveToPoint(player1, goal);
}

const simpleCurve = (x) => 0.971 + 3.43 * x - 3.43 * x * x;

function startBall(clickEvent) {
  const goal = getGoalPosition(clickEvent);
  const r = Number(ball.getAttribute('r'));
  return moveToPoint(ball, goal, ({ progress, id }) => {
    if (distance(player3, ball) < 100) {
      removeTickFunc(id);
    }
    ball.setAttribute('r', Number(r) * simpleCurve(progress));
  });
}

function tickPlayer2({ id }) {
  const p1Pos = getBodyPosition(player1);

  const start = getBodyPosition(player2);
  const dist = distance(start, p1Pos);

  if (dist < 50) {
    removeTickFunc(id);
  }

  let speed = keyDict.Space ? 4 : 2;

  const x = start.x + ((p1Pos.x - start.x) / dist) * speed;
  const y = start.y + ((p1Pos.y - start.y) / dist) * speed;
  player2.setAttribute('cx', x);
  player2.setAttribute('cy', y);
}

const testPath = `M 0,0
l 100,150
l 0,0
l 150,0
l0,0`;

function getPath({ x, y }) {
  return testPath.replace('M 0,0', `M ${x}, y`);
}

function newPath({ x, y }, originalPath) {
  const newPath = originalPath.cloneNode();
  newPath.setAttribute(
    'd',
    newPath.getAttribute('d').replace('M 0,0', `M ${x}, ${y}`)
  );
  return newPath;
}

function startPlayer3() {
  const start = getBodyPosition(player3);
  const route = newPath(start, path);
  const dist = route.getTotalLength();
  const goal = route.getPointAtLength(dist);
  const duration = dist / (speed * 0.1);
  const startTime = performance.now();

  const runToBall = ({ id }) => {
    const goal = getBodyPosition(ball);
    const start = getBodyPosition(player3);
    const dist = distance(start, goal);

    if (dist < 25) {
      console.log(id);
      removeTickFunc(id);
      // move to endzone
    }

    const x = start.x + ((goal.x - start.x) / dist) * speed;
    const y = start.y + ((goal.y - start.y) / dist) * speed;
    player3.setAttribute('cx', x);
    player3.setAttribute('cy', y);
  };

  return createFrameFunc({
    startTime,
    duration,
    onTick: ({ progress, id }) => {
      const { x, y } = route.getPointAtLength(progress * dist);
      player3.setAttribute('cx', x);
      player3.setAttribute('cy', y);

      console.log(distance({ x, y }, ball));
      if (distance(player3, ball) < 100) {
        removeTickFunc(id);
        addTickFunc(runToBall);
      }
    },
    onFinish: (removeFunc) => {
      player3.setAttribute('cx', goal.x);
      player3.setAttribute('cy', goal.y);
      removeFunc();
      return;
    },
  });
}

function handleClick(clickEvent) {
  if (playRunning) {
    addTickFunc(startBall(clickEvent));
  } else {
    addTickFunc(tickPlayer2);
    addTickFunc(startPlayer3());
    playRunning = true;
  }
}

let playRunning = false;
svgField.addEventListener('click', handleClick);

start();
