import './style.scss';
import { Explosions } from './ts/explosions';
import { Grid, Vignette } from './ts/foreground';
import { Background, Stars } from './ts/background';
import { Bullets } from './ts/bullets';
import { Enemy } from './ts/enemy';
import { Player } from './ts/player';
import { Sounds } from './ts/sounds';
import { Score } from './ts/score';
// import { Sprites } from './ts/sprites';

export const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const gameContainer = document.getElementById('game-container');
export const settings = document.getElementById('settings');
export const upgrade = document.getElementById('upgrade');
export const leaderboard = document.getElementById('leaderboard');
export const pauseText = document.getElementById('pause-text');
export const scoreEl = document.getElementById('score');
export const menu = document.getElementById('menu');

export const width = window.innerWidth > gameCanvas.width ? window.innerWidth : gameCanvas.width;
export const height =
    window.innerHeight > gameCanvas.height ? window.innerHeight : gameCanvas.height;

gameCanvas.width = width;
gameCanvas.height = height;

export const ctx = gameCanvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

export let mouseX = 300;
export let mouseY = fit(height / 2);

export let masterVolume = 0.3;

export let pause = false;

let then = Date.now();

function main(now?: number) {
    const dt = ~~(now - then);
    then = now;

    if (!pause) {
        update(dt);
        render();
    }

    requestAnimationFrame(main);
}

function update(dt: number) {
    Enemy.updateAll();
    player.update();

    Enemy.trySpawn();
}

function render() {
    bg.render();
    stars.render();
    Enemy.renderAll();
    player.render();
    bullets.render();
    explosions.render();
    grid.render();
    vignette.render();
}

function init() {
    grid.load('pix', './assets/img/pixpat.png').then(() => grid.set('pix'));
    grid.load('cell', './assets/img/cellpat.png');
    grid.load('dot', './assets/img/dotpat.png');

    sounds.load('explosion', './assets/audio/explosion.wav');
    sounds.load('lasershot', './assets/audio/lasershot.wav');
    sounds.load('death', './assets/audio/death.wav');

    gameContainer.addEventListener('contextmenu', e => e.preventDefault(), false);
    gameContainer.addEventListener('mouseup', gameMouseUp);
    gameContainer.addEventListener('mousedown', gameMouseDown);
    gameContainer.addEventListener('mousemove', gameMouseMove);
    gameContainer.addEventListener('mouseenter', gameMouseEnter);
    gameContainer.addEventListener('mouseleave', gameMouseLeave);

    main();
}

export function randomColor(alpha = 1) {
    let r = ~~(Math.random() * 256);
    let g = ~~(Math.random() * 256);
    let b = ~~(Math.random() * 256);
    return `rgba(${r},${g},${b},${alpha})`;
}

export function fit(n: number) {
    return ~~(n / 10) * 10;
}

export function glow(colorFrom: string, colorTo: string, x: number, y: number, size = 50) {
    const radial = ctx.createRadialGradient(x, y, size / 2, x, y, 0);

    radial.addColorStop(0, colorTo);
    radial.addColorStop(1, colorFrom);

    ctx.fillStyle = radial;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

export const sprites = new Image();
sprites.src = './assets/img/sprites.png';

// export const sprites = new Sprites('./assets/img/sprites.png');
export const sounds = new Sounds();
export const stars = new Stars();
export const bg = new Background();
export const score = new Score();
export const player = new Player();
export const grid = new Grid();
export const vignette = new Vignette();
export const explosions = new Explosions();
export const bullets = new Bullets();

function gameMouseDown(e: MouseEvent) {
    e.preventDefault();

    if (e.button === 0) {
        player.makeShot();
    } else if (e.button === 1) {
        score.up(1000); // remove later
    } else if (e.button === 2) {
        openMenu(e);
    }
}

function openMenu(e: MouseEvent) {
    setPause();

    menu.style.display = 'block';
    menu.style.left = e.clientX + 40 + 'px';
    menu.style.top = e.clientY - 60 + 'px';
    menu.style.animation = 'open-menu 0.5s';
}

function hideMenu() {
    setPlay();

    menu.style.display = 'none';
    menu.style.animation = 'none';
}

function gameMouseUp(e: MouseEvent) {
    if (e.button === 2) {
        if (e.target === settings) {
            hideMenu();
        } else if (e.target === upgrade) {
            hideMenu();
        } else if (e.target === leaderboard) {
            hideMenu();
        } else {
            hideMenu();
        }
    }
}

function gameMouseMove(e: MouseEvent) {
    mouseX = e.clientX - gameCanvas.offsetLeft;
    mouseY = e.clientY - gameCanvas.offsetTop;
}

function gameMouseEnter() {
    setPlay();
    pauseText.style.display = 'none';
    scoreEl.style.opacity = '0.5';
}

function gameMouseLeave() {
    hideMenu();
    setPause();
    pauseText.style.display = 'block';
    scoreEl.style.opacity = '0';
}

function setPause() {
    pause = true;
    gameContainer.style.cursor = 'default';
    gameCanvas.getAnimations().forEach(e => e.finish());
    gameCanvas.style.filter = 'blur(10px)';
}

function setPlay() {
    pause = false;
    gameContainer.style.cursor = 'none';
    gameCanvas.style.filter = 'blur(0)';
}

init();
