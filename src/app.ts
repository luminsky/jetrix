import './style.css';
import { IStar } from './types';

const game = document.getElementById('game') as HTMLCanvasElement;
const gameContainer = document.getElementById('game-container');
const offscreen = document.createElement('canvas');
const width = (game.width = offscreen.width = window.innerWidth);
const height = (game.height = offscreen.height = window.innerHeight);
const ctx = game.getContext('2d');
const offscreenCtx = offscreen.getContext('2d');

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
  lasershot: undefined,
  explosion: undefined,
  play(name: string) {
    this[name].play();
  },
};

sounds.explosion = new Audio('./assets/audio/explosion.wav');
sounds.explosion.volume = 0.5;
sounds.lasershot = new Audio('./assets/audio/lasershot.wav');
sounds.lasershot.volume = 0.5;

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

const stars: IStar[] = [];

for (let i = 0; i < Math.round(height / 10); i++) {
  stars.push({ x: Math.round((Math.random() * width) / 10) * 10 });
}

function setStarOptions(color, speed, opacity, tailLength, spaceDepth, posX?) {
  let layer = 0;

  for (let star of stars) {
    if (posX) star.x = posX;
    star.color = color;
    star.speed =
      +(speed * ((spaceDepth - layer) / +spaceDepth)).toFixed(1) + speed / 10;
    star.opacity =
      +(opacity * ((spaceDepth - layer) / +spaceDepth)).toFixed(2) +
      opacity / 10;
    star.tailLength = layer < tailLength ? tailLength - layer : 0;

    if (layer === spaceDepth) layer = 0;
    else layer++;
  }
}

setStarOptions('#f0f', 9, 0.3, 4, 10);

function drawStars() {
  stars.forEach((star, y) => {
    ctx.fillStyle = star.color;
    ctx.globalAlpha = star.opacity;

    ctx.fillRect(star.x, y * 10, 10, 10);

    if (star.tailLength) {
      for (let i = 1; i <= star.tailLength; i++) {
        ctx.globalAlpha =
          (star.opacity / 2) * ((star.tailLength - i) / star.tailLength);
        ctx.fillRect(star.x + i * 10, y * 10, 10, 10);
      }
    }

    if (star.x <= 0) star.x = width + Math.random() * 200;
    else star.x -= star.speed;

    star.x = ~~star.x;
  });

  ctx.globalAlpha = 1;
}

const pix = new Image();
pix.src = './assets/img/pixpat.png';
const dot = new Image();
dot.src = './assets/img/dotpat.png';
const cell = new Image();
cell.src = './assets/img/cellpat.png';

pix.onload = function () {
  setGrid(pix);
};

function setGrid(pattern: HTMLImageElement) {
  offscreenCtx.clearRect(0, 0, offscreen.width, offscreen.height);
  offscreenCtx.fillStyle = ctx.createPattern(pattern, 'repeat');
  offscreenCtx.fillRect(0, 0, width, height);
}

function drawGrid() {
  ctx.drawImage(offscreen, 0, 0);
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
  let i = bullets.push({
    type: player.gun,
    x: player.pos[0] + player.width,
    y: player.pos[1] + player.height / 2 - 2,
    end: width,
    age: 0.5,
    id: bullets.length,
  });

  for (let unit of Enemy.units) {
    if (unit) {
      if (
        bullets[i - 1].y >= unit.pos[1] &&
        bullets[i - 1].y <= unit.pos[1] + unit.height
      ) {
        bullets[i - 1].end = unit.pos[0] - bullets[i - 1].x;
        unit.explode();
        score.up(10);
        break;
      }
    }
  }

  sounds.play(player.gun + 'shot');

  // glow(
  //   '#f00',
  //   mousePos[0] + player.width,
  //   roundTo10(mousePos[1]) + player.height / 2
  // );
}

function updateBullets() {}

function drawBullets() {
  for (let bullet of bullets) {
    if (bullet) {
      switch (bullet.type) {
        case 'laser':
          if ((bullet.age -= 0.02) <= 0) bullets[bullet.id] = null;

          ctx.fillStyle = `rgba(255,0,0,${bullet.age.toFixed(1)})`;
          ctx.fillRect(bullet.x, bullet.y, bullet.end, 4);

          break;
        case 'tesla':
          break;
        case 'plasma':
          break;
      }
    }
  }
}

/* Enemies */

class Enemy {
  static units: Enemy[] = [];
  pos = [width, 0];
  width = 100;
  height = 70;
  speed = 5;
  id = 0;

  constructor(yPos: number) {
    this.pos[1] = yPos;
    this.id = Enemy.units.length;
  }

  static spawn() {
    if (chance(1, 100)) {
      this.units.push(new this(roundTo10(Math.random() * (height - 100) + 50)));
    }

    function chance(value: number, outOf: number) {
      return Math.random() * outOf > outOf - value;
    }
  }

  explode() {
    Enemy.units[this.id] = null;
    sounds.play('explosion');
  }
}

function drawEnemies() {
  for (let unit of Enemy.units) {
    if (unit)
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
  for (let unit of Enemy.units) {
    if (
      unit &&
      player.pos[0] < unit.pos[0] + unit.width &&
      player.pos[0] + player.width > unit.pos[0] &&
      player.pos[1] < unit.pos[1] + unit.height &&
      player.pos[1] + player.height > unit.pos[1]
    ) {
      unit.explode();
      score.clear();
    }
  }
}

function updatePos() {
  player.pos[0] = roundTo10(mousePos[0]);
  player.pos[1] = roundTo10(mousePos[1]);

  if (player.pos[0] < 0) player.pos[0] = 0;
  if (player.pos[0] + player.width > width)
    player.pos[0] = roundTo10(width) - player.width;
  if (player.pos[1] < 0) player.pos[1] = 0;
  if (player.pos[1] + player.height > height)
    player.pos[1] = roundTo10(height) - player.height;

  for (let unit of Enemy.units) {
    if (unit) {
      unit.pos[0] -= unit.speed;
      if (unit.pos[0] < 0 - unit.width) {
        unit.explode();
        score.clear();
      }
    }
  }
}

let then = 0;

function renderScene(now: number) {
  now = ~~now;
  const deltaTime = now - then;
  then = now;

  if (!playMode) {
    drawBackground();
    drawStars();

    updatePos();
    updateBullets();
    checkCollisions();
    Enemy.spawn();
    drawEnemies();
    drawFlame();
    drawPlayer();
    drawBullets();

    drawGrid();
    drawVignette();
  }

  requestAnimationFrame(renderScene);
}

function gameMouseDown(e: MouseEvent) {
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

function gameMouseUp(e: MouseEvent) {
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

function gameMouseMove(e: MouseEvent) {
  mousePos[0] = ~~(e.clientX - game.getBoundingClientRect().left);
  mousePos[1] = ~~(e.clientY - game.getBoundingClientRect().top);
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

gameContainer.addEventListener('contextmenu', (e) => e.preventDefault(), false);
gameContainer.addEventListener('mouseup', gameMouseUp);
gameContainer.addEventListener('mousedown', gameMouseDown);
gameContainer.addEventListener('mousemove', gameMouseMove);
gameContainer.addEventListener('mouseenter', gameMouseEnter);
gameContainer.addEventListener('mouseleave', gameMouseLeave);

requestAnimationFrame(renderScene);
