import './style.css';
import { IStar } from './types';

const game = document.getElementById('game') as HTMLCanvasElement;
const gameContainer = document.getElementById('game-container');
const width = (game.width = window.innerWidth);
const height = (game.height = window.innerHeight);
const ctx = game.getContext('2d');

ctx.imageSmoothingEnabled = false;

const settings = document.getElementById('settings');
const upgrade = document.getElementById('upgrade');
const leaderboard = document.getElementById('scoreboard');

const menu = document.getElementById('menu');

const pause = document.getElementById('pause');
const scoreboard = document.getElementById('score');
const mousePos = [300, height / 2];
let playMode = false;

const sprites = new Image();
sprites.src = './assets/img/sprites.png';

const sounds = {
  lasershoot: undefined,
  play(name: string) {
    this[name].play();
  },
};

sounds.lasershoot = new Audio('./assets/audio/lasershoot.wav');
sounds.lasershoot.volume = 0.5;

function randomColor(alpha = 1) {
  let r = Math.round(Math.random() * 255);
  let g = Math.round(Math.random() * 255);
  let b = Math.round(Math.random() * 255);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundTo10(n: number) {
  return Math.floor(n / 10) * 10;
}

const particles = [];
const explosions = [];
const bullets = [];

const player = {
  pos: [mousePos[0], mousePos[1]],
  width: 100,
  height: 70,
  gun: 'laser',
  skin: 'default',
  flameFrame: 0,
};

function createScore() {
  let count = 0;

  return {
    display: (value = count) => (scoreboard.textContent = String(value)),

    up: (amount: number) => {
      count += amount;
      score.display();
    },

    clear: () => {
      count = 0;
      score.display();
    },

    spend: (amount: number) => {
      if (+count >= amount) {
        count = +count - amount;
        score.display();
      } else console.log('not enough points');
    },
  };
}

const score = createScore();

/* Background and front drawing */

const background = ctx.createLinearGradient(width / 2, 0, width / 2, height);
background.addColorStop(0, 'rgba(0, 0, 10, 1)');
background.addColorStop(0.5, 'rgba(0, 0, 30, 1)');
background.addColorStop(1, 'rgba(0, 0, 10, 1)');

function drawBackground() {
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
}

const stars: IStar[] = new Array(Math.round(height / 10))
  .fill(0)
  .map(() => [Math.round((Math.random() * width) / 10) * 10]);

function setStarOptions(color, speed, opacity, tailLength, spaceDepth, xPos?) {
  let i = 0;

  for (let star of stars) {
    if (xPos) star[0] = xPos;
    star[1] = color;
    star[2] =
      +(speed * ((spaceDepth - i) / +spaceDepth)).toFixed(1) + speed / 10;
    star[3] =
      +(opacity * ((spaceDepth - i) / +spaceDepth)).toFixed(2) + opacity / 10;
    star[4] = i < tailLength ? tailLength - i : 0;

    if (i === spaceDepth) i = 0;
    else i++;
  }
}

setStarOptions('#f0f', 9, 0.3, 4, 10);

function drawStars() {
  stars.forEach((star, y) => {
    ctx.fillStyle = star[1];
    ctx.globalAlpha = star[3];

    ctx.fillRect(star[0], y * 10, 10, 10);

    if (star[4]) {
      for (let i = 1; i <= star[4]; i++) {
        ctx.globalAlpha = (star[3] / 2) * ((star[4] - i) / star[4]);
        ctx.fillRect(star[0] + i * 10, y * 10, 10, 10);
      }
    }

    if (star[0] <= 0) star[0] = width;
    else star[0] -= star[2];
  });

  ctx.globalAlpha = 1;
}

const pix = new Image();
pix.src = './assets/img/pixpat.png';
const dot = new Image();
dot.src = './assets/img/dotpat.png';
const cell = new Image();
cell.src = './assets/img/cellpat.png';

let grid: CanvasPattern;

pix.onload = function () {
  grid = ctx.createPattern(this as HTMLImageElement, 'repeat');
};

function drawGrid() {
  ctx.fillStyle = grid;
  ctx.fillRect(0, 0, width, height);
}

const vignette = ctx.createRadialGradient(
  width / 2,
  height / 2,
  300,
  width / 2,
  height / 2,
  width
);
vignette.addColorStop(0, '#0000');
vignette.addColorStop(1, '#000f');

function drawVignette() {
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function glow(colorHEX = '#fff', x, y, size = 20) {
  let glow = ctx.createRadialGradient(x, y, size, x, y, 0);
  glow.addColorStop(0, colorHEX + '0');
  glow.addColorStop(1, colorHEX + 'f');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, x + 20, y + 20);
}

/* Controllers, Pause and Menu */

/* Player */

function drawPlayer() {
  ctx.drawImage(
    sprites, // image
    0,
    0, // start copy
    10,
    7, // copying shift
    player.pos[0],
    player.pos[1], // start paste
    player.width,
    player.height
  ); // paste shift
}

function drawFlame() {
  ctx.globalAlpha = Math.random() * 0.5 + 0.2;

  ctx.drawImage(
    sprites,
    20,
    0 + player.flameFrame,
    3,
    7,
    player.pos[0] - 30,
    player.pos[1],
    30,
    70
  );

  player.flameFrame += 7;
  if (player.flameFrame === 21) player.flameFrame = 0;

  ctx.globalAlpha = 1;
}

function makeShot() {
  sounds.play('lasershoot');

  switch (player.gun) {
    case 'laser':
      throwLaser();
      break;
    case 'plasma':
      // throwPlasma();
      break;
    case 'tesla':
    // throwTesla();
  }
}

function throwLaser() {
  // ?
  ctx.fillStyle = 'red';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(
    mousePos[0] + player.width,
    mousePos[1] + player.height / 2,
    width,
    -(Math.random() * 3 + 4)
  );
  glow(
    '#f00',
    mousePos[0] + player.width,
    roundTo10(mousePos[1]) + player.height / 2
  );

  for (let i = 0; i < 10; i++) {}
}

/* Enemies */
class Enemy {
  static units = [];
  pos = [width, 0];
  width = 100;
  height = 70;
  speed = 5;

  constructor(yPos: number) {
    this.pos[1] = yPos;
  }

  static spawn() {
    if (chance(1, 100)) {
      this.units.push(new this(roundTo10(Math.random() * (height - 100) + 50)));
    }

    function chance(value: number, outOf: number) {
      return Math.random() * outOf > outOf - value;
    }
  }
}

function drawEnemies() {
  for (let unit of Enemy.units) {
    ctx.drawImage(
      sprites,
      10,
      0,
      10,
      7,
      roundTo10(unit.pos[0]),
      roundTo10(unit.pos[1]),
      100,
      70
    );
  }
}

/* Render and Updating */

function checkCollisions() {
  // return (x >= this.x - this.w/2 && x <= this.x + this.w/2) &&
  //     (y >= this.y - this.h/2 && y <= this.y + this.h/2);
}

function updatePos() {
  player.pos = [roundTo10(mousePos[0]), roundTo10(mousePos[1])];
  if (player.pos[0] < 0) player.pos[0] = 0;
  if (player.pos[0] + player.width > width)
    player.pos[0] = roundTo10(width) - player.width;
  if (player.pos[1] < 0) player.pos[1] = 0;
  if (player.pos[1] + player.height > height)
    player.pos[1] = roundTo10(height) - player.height;

  for (let unit of Enemy.units) {
    unit.pos[0] -= unit.speed;
    if (unit.pos[0] < 0 - unit.width) Enemy.units.shift();
  }
}

function renderScene() {
  if (!playMode) {
    drawBackground();
    drawStars();

    checkCollisions();
    updatePos();
    Enemy.spawn();
    drawEnemies();
    drawFlame();
    drawPlayer();

    drawGrid();
    drawVignette();
  }

  requestAnimationFrame(renderScene);
}

function gameMouseDown(e) {
  e.preventDefault();
  switch (e.which) {
    case 1:
      makeShot();
      break;
    case 2:
      setStarOptions(
        randomColor(),
        Math.round(Math.random() * 30),
        Math.random().toFixed(2),
        Math.round(Math.random() * 10),
        10
      );
      break;
    case 3:
      menu.style.display = 'block';
      menu.style.top = roundTo10(mousePos[1]) + 'px';
      menu.style.left = roundTo10(mousePos[0]) + 'px';
      if (menu.style.width) game.style.filter = 'brightness(70%)';
      game.style.webkitFilter = 'brightness(70%)';
      menu.style.animation = 'menu 0.5s';
  }
}

function hideMenu() {
  menu.style.display = 'none';
  menu.style.animation = 'none';
  game.style.filter = 'brightness(100%)';
  game.style.webkitFilter = 'brightness(100%)';
}

function gameMouseUp(e) {
  switch (e.target) {
    case settings:
      makeShot();
      break;
    case upgrade:
      break;
    case leaderboard:
      break;
    default:
      hideMenu();
  }
}

function gameMouseMove(e) {
  mousePos[0] = e.clientX - game.getBoundingClientRect().left;
  mousePos[1] = e.clientY - game.getBoundingClientRect().top;
}

function gameMouseEnter() {
  playMode = false;
  game.style.filter = 'blur(0)';
  game.style.webkitFilter = 'blur(0)';
  pause.style.display = 'none';
  scoreboard.style.opacity = '0.5';
}

function gameMouseLeave() {
  hideMenu();
  playMode = true;
  game.style.filter = 'blur(25px)';
  game.style.webkitFilter = 'blur(25px)';
  pause.style.display = 'block';
  scoreboard.style.opacity = '0';
}

requestAnimationFrame(renderScene);

gameContainer.addEventListener('contextmenu', (e) => e.preventDefault(), false);

gameContainer.addEventListener('mouseup', gameMouseUp);
gameContainer.addEventListener('mousedown', gameMouseDown);
gameContainer.addEventListener('mousemove', gameMouseMove);
gameContainer.addEventListener('mouseenter', gameMouseEnter);
gameContainer.addEventListener('mouseleave', gameMouseLeave);
