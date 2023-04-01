import './style.css';

const template = `
<svg id="field" width="300" height="200" viewBox="0 0 300 200">
  <circle class="player" id="player1" cx="25" cy="25" r="25" />
  <circle class="ball" id="ball" cx="25" cy="25" r="10" />
  <circle class="player" id="player2" cx="25" cy="75" r="25" />
  <path
    id="play-path"
    d="M 0,0
        l 100,100
        l 0,0
        l 150,0
        l0,0"
  />
</svg>

`;

document.body.innerHTML = template;
const svgField = document.getElementById('field');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const path = document.getElementById('play-path');
const playerRect = player1.getBoundingClientRect();
const svgRect = svgField.getBoundingClientRect();
let animationFrameId = null;
let speed = 1;

function animatePlayer2() {}

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

function handleClick(clickEvent) {
  const goal = getGoalPosition(clickEvent);
  startAnimation(goal);
}

function startAnimation(goal) {
  cancelAnimationFrame(animationFrameId);

  const start = {
    x: parseFloat(player1.getAttribute('cx')),
    y: parseFloat(player1.getAttribute('cy')),
  };
  const distance = Math.sqrt((goal.x - start.x) ** 2 + (goal.y - start.y) ** 2);
  const duration = distance / (speed * 0.1);
  const startTime = performance.now();

  function animate(currentTime) {
    const progress = (currentTime - startTime) / duration;

    const elapsedTime = currentTime - startTime;
    // console.log(elapsedTime, duration, progress);
    if (progress >= 1) {
      player1.setAttribute('cx', goal.x);
      player1.setAttribute('cy', goal.y);
      return;
    }

    // const progress = elapsedTime / duration;
    const x = start.x + (goal.x - start.x) * progress;
    const y = start.y + (goal.y - start.y) * progress;
    player1.setAttribute('cx', x);
    player1.setAttribute('cy', y);
    animatePlayer2(x, y);

    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);
}

svgField.addEventListener('click', handleClick);
