import './style.css';

const svgField = document.getElementById('field');
const playerRect = document.getElementById('player');

svgField.addEventListener('click', function (event) {
  const rect = svgField.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const duration = Math.random() * 2 + 1; // Random duration between 1 and 3 seconds
  playerRect.style.animation = `move ${duration}s forwards`;
  playerRect.style.setProperty(
    '--x',
    `${x - playerRect.getAttribute('width') / 2}px`
  );
  playerRect.style.setProperty(
    '--y',
    `${y - playerRect.getAttribute('height') / 2}px`
  );
});

playerRect.addEventListener('animationend', function () {
  playerRect.style.animation = 'none';
  console.log('Animation finished!');
});
