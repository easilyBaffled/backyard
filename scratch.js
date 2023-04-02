import './style.css';

const template = `
<svg id="field" viewBox="0 0 300 200">
  <circle class="player" id="player1" cx="25" cy="25" r="25" />
  <circle class="ball" id="ball" cx="25" cy="25" r="10" />
  <circle class="player" id="player2" cx="250" cy="150" r="25" />
  <circle class="player" id="player3" cx="25" cy="75" r="25" />
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
  `field player1 player2 player3, path`
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
  return (currentTime, id) => {
    const progress = (currentTime - startTime) / duration;

    if (progress >= 1) {
      return onFinish?.(() => removeTickFunc(id));
    }
    return onTick({ progress });
  };
}

function getPlayerPosition(player) {
  return {
    x: parseFloat(player.getAttribute('cx')),
    y: parseFloat(player.getAttribute('cy')),
  };
}

function distance(start, goal) {
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
  Object.entries(tickFunctions).forEach(([id, fn]) => fn(currentTime, id));

  animationFrameId = requestAnimationFrame(tick);
}

const keyDict = {};

document.addEventListener('keydown', ({ code }) => {
  keyDict[code] = true;
});

document.addEventListener('keyup', ({ code }) => {
  delete keyDict[code];
});

const testPath = `M 0,0
l 100,150
l 0,0
l 150,0
l0,0`;

function getPath({ x, y }) {
  return testPath.replace('M 0,0', `M ${x}, y`);
}

function startPlayer3() {
  const start = getPlayerPosition(player3);
  const dist = path.getTotalLength();
  const duration = dist / (speed * 0.1);
  const startTime = performance.now();

  return createFrameFunc({
    startTime,
    duration,
    onTick: ({ progress }) => {
      const x = start.x + (goal.x - start.x) * progress;
      const y = start.y + (goal.y - start.y) * progress;
      player1.setAttribute('cx', x);
      player1.setAttribute('cy', y);
    },
    onFinish: (removeFunc) => {
      player1.setAttribute('cx', goal.x);
      player1.setAttribute('cy', goal.y);
      removeFunc();
      return;
    },
  });
}

function handleClick(clickEvent) {
  addTickFunc(tickPlayer2);
  addTickFunc(startPlayer1(clickEvent));
}

svgField.addEventListener('click', handleClick);

start();
