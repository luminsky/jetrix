import './style.scss';
import { IExplosion, IBullet, IStar, IStarOptions } from './types';

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const gameContainer = document.getElementById('game-container');
const settings = document.getElementById('settings');
const upgrade = document.getElementById('upgrade');
const leaderboard = document.getElementById('leaderboard');
const pauseText = document.getElementById('pause-text');
const scoreEl = document.getElementById('score');
const menu = document.getElementById('menu');

const width = window.innerWidth > gameCanvas.width ? window.innerWidth : gameCanvas.width;
const height = window.innerHeight > gameCanvas.height ? window.innerHeight : gameCanvas.height;

gameCanvas.width = width;
gameCanvas.height = height;

const ctx = gameCanvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

let mouseX = 300;
let mouseY = fit(height / 2);

let pause = false;

let masterVolume = 0.3;

function randomColor(alpha = 1) {
    let r = ~~(Math.random() * 256);
    let g = ~~(Math.random() * 256);
    let b = ~~(Math.random() * 256);
    return `rgba(${r},${g},${b},${alpha})`;
}

function fit(n: number) {
    return ~~(n / 10) * 10;
}

function glow(colorFrom: string, colorTo: string, x: number, y: number, size = 50) {
    const radial = ctx.createRadialGradient(x, y, size / 2, x, y, 0);

    radial.addColorStop(0, colorTo);
    radial.addColorStop(1, colorFrom);

    ctx.fillStyle = radial;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

const sprites = new Image();
sprites.src = './assets/img/sprites.png';

class Sounds {
    units: Map<string, HTMLAudioElement> = new Map();

    constructor() {
        this.load('explosion', './assets/audio/explosion.wav');
        this.load('lasershot', './assets/audio/lasershot.wav');
        this.load('death', './assets/audio/death.wav');
    }

    load(name: string, src: string) {
        const sound = new Audio(src);

        this.units.set(name, sound);
        sound.volume = masterVolume;
    }

    play(name: string) {
        const sound = this.units.get(name);

        sound.currentTime = 0;
        sound.play();
    }
}

class Player {
    x = mouseX;
    y = mouseY;
    width = 100;
    height = 70;
    gun = 'laser';
    skin = 'default';
    flameFrame = 0;
    speed = 250;

    constructor() {}

    update() {
        const diffX = mouseX - this.x;
        const diffY = mouseY - this.y;

        if (diffX) {
            this.x += Math.abs(diffX) <= this.speed ? diffX : diffX > 0 ? this.speed : -this.speed;
            this.x = fit(this.x);
        }

        if (diffY) {
            this.y += Math.abs(diffY) <= this.speed ? diffY : diffY > 0 ? this.speed : -this.speed;
            this.y = fit(this.y);
        }

        // check screen edges
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > width) {
            this.x = fit(width) - this.width + 10;
        }

        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.height > height) {
            this.y = fit(height) - this.height;
        }
    }

    makeShot() {
        const bullet: IBullet = {
            x: this.x + this.width,
            y: this.y + this.height / 2,
            start: this.x + this.width,
            end: width,
            age: 0.5,
            type: this.gun,
        };

        bullets.add(bullet);

        for (const unit of Enemy.units) {
            if (bullet.y >= unit.y && bullet.y <= unit.y + unit.height && bullet.x < unit.x) {
                bullet.end = unit.x;
                unit.kill();
                score.up(10);
                break;
            }
        }

        sounds.play(this.gun + 'shot');
    }

    render() {
        this.renderShipFire();

        ctx.drawImage(sprites, 0, 0, 10, 7, this.x, this.y, this.width, this.height);
    }

    renderShipFire() {
        ctx.globalAlpha = Math.random() * 0.5 + 0.2;

        ctx.drawImage(sprites, 20, 0 + this.flameFrame, 3, 7, this.x - 30, this.y, 30, 70);

        this.flameFrame += 7;
        this;

        if (this.flameFrame === 21) {
            this.flameFrame = 0;
        }

        ctx.globalAlpha = 1;
    }
}

class Score {
    #count = 0;

    constructor() {}

    get count() {
        return this.#count;
    }

    render(value: number | string = this.#count) {
        scoreEl.textContent = String(value);
    }

    up(amount: number) {
        this.#count += amount;
        this.render();
    }

    clear() {
        this.#count = 0;
        this.render();
        sounds.play('death');
    }

    spend(amount: number) {
        if (this.#count >= amount) {
            this.#count = this.#count - amount;
            this.render();
        } else {
            // not enough points
        }
    }
}

class Background {
    gradient: CanvasGradient;

    constructor() {
        this.gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
        this.gradient.addColorStop(0, 'rgba(0, 0, 10, 1)');
        this.gradient.addColorStop(0.5, 'rgba(0, 0, 30, 1)');
        this.gradient.addColorStop(1, 'rgba(0, 0, 10, 1)');
    }

    render() {
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.gradient;
        ctx.fillRect(0, 0, width, height);
    }
}

class Stars {
    units: Set<IStar> = new Set();

    constructor() {
        for (let i = 0; i < Math.round(height / 10); i++) {
            this.units.add({
                x: Math.round((Math.random() * width) / 10) * 10,
                y: i,
            });
        }

        this.configure({
            color: '#f0f',
            speed: 9,
            opacity: 0.3,
            tailLength: 4,
            spaceDepth: 10,
        });
    }

    configure(options: IStarOptions) {
        let layer = 0;

        for (const star of this.units) {
            star.x = options.x || star.x;

            star.color = options.color;

            star.speed = +(
                options.speed * ((options.spaceDepth - layer) / options.spaceDepth) +
                options.speed / 10
            ).toFixed(1);

            star.opacity = +(
                options.opacity * ((options.spaceDepth - layer) / options.spaceDepth) +
                options.opacity / 10
            ).toFixed(2);

            star.tailLength = layer < options.tailLength ? options.tailLength - layer : 0;

            layer = layer === options.spaceDepth ? 0 : layer + 1;
        }
    }

    render() {
        for (const star of this.units) {
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;

            ctx.fillRect(star.x, star.y * 10, 10, 10);

            if (star.tailLength) {
                for (let i = 1; i <= star.tailLength; i++) {
                    ctx.globalAlpha =
                        (star.opacity / 2) * ((star.tailLength - i) / star.tailLength);
                    ctx.fillRect(star.x + i * 10, star.y * 10, 10, 10);
                }
            }

            if (star.x <= 0) {
                star.x = width + Math.random() * 200;
            } else {
                star.x -= star.speed + score.count / 200;
            }

            star.x = ~~star.x;
        }

        ctx.globalAlpha = 1;
    }
}

class Grid {
    canvas: HTMLCanvasElement = document.createElement('canvas');
    ctx: CanvasRenderingContext2D;
    patterns: Map<string, CanvasPattern> = new Map();

    constructor() {
        this.canvas;
        this.canvas.width = gameCanvas.width;
        this.canvas.height = gameCanvas.height;
        this.ctx = this.canvas.getContext('2d');

        this.add('pix', './assets/img/pixpat.png').then(() => {
            this.set('pix');
        });

        this.add('cell', './assets/img/cellpat.png');
        this.add('dot', './assets/img/dotpat.png');
    }

    add(name: string, src: string) {
        return new Promise<CanvasPattern>(resolve => {
            const image = new Image();
            image.src = src;

            image.onload = () => {
                const pattern = ctx.createPattern(image, 'repeat');

                this.patterns.set(name, pattern);

                resolve(pattern);
            };
        });
    }

    set(name: string) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.patterns.get(name);
        this.ctx.fillRect(0, 0, width, height);
    }

    render() {
        ctx.drawImage(this.canvas, 0, 0);
    }
}

class Vignette {
    gradient: CanvasGradient;

    constructor() {
        this.gradient = ctx.createRadialGradient(
            width / 2,
            height / 2,
            300,
            width / 2,
            height / 2,
            width
        );
        this.gradient.addColorStop(0, '#0000');
        this.gradient.addColorStop(1, '#000f');
    }
    render() {
        ctx.fillStyle = this.gradient;
        ctx.fillRect(0, 0, width, height);
    }
}

class Enemy {
    static units: Set<Enemy> = new Set();

    x = width;
    y = 0;
    width = 100;
    height = 70;
    speed = 5;

    constructor(y: number) {
        this.y = y;
    }

    static spawn() {
        if (Math.random() * 100 > 100 - (1 + ~~(score.count / 1000))) {
            this.units.add(new this(fit(Math.random() * (height - 100) + 50)));
        }
    }

    static updateAndRenderAll() {
        for (const unit of Enemy.units) {
            if (unit.x <= -unit.width) {
                unit.kill();
                score.clear();
            } else {
                unit.x -= unit.speed + ~~(score.count / 150);
            }

            // collision
            if (
                player.x < unit.x + unit.width &&
                player.x + player.width > unit.x &&
                player.y < unit.y + unit.height &&
                player.y + player.height > unit.y
            ) {
                unit.kill();
                score.clear();
            }

            ctx.drawImage(sprites, 10, 0, 10, 7, ~~unit.x, ~~unit.y, 100, 70);
        }
    }

    kill() {
        Enemy.units.delete(this);
        sounds.play('explosion');

        gameCanvas.animate([{ filter: 'brightness(150%)' }, { filter: 'brightness(100%)' }], {
            duration: 500,
            iterations: 1,
        });

        const explosion: IExplosion = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            age: 1,
        };

        explosions.add(explosion);
    }
}

class Explosions {
    units: Set<IExplosion> = new Set();

    constructor() {}

    add(explosion: IExplosion) {
        this.units.add(explosion);
    }

    render() {
        for (const explosion of this.units) {
            if (explosion.age <= 0) {
                this.units.delete(explosion);
            } else {
                glow(
                    `rgba(100,${150},${255},${explosion.age.toFixed(1)})`,
                    `rgba(255,${0},${0},0)`,
                    explosion.x,
                    explosion.y,
                    ~~(explosion.age * (150 - Math.cos((150 * Math.PI) / 2)))
                );

                explosion.x -= 8;
                explosion.age -= 0.02;
            }
        }
    }
}

class Bullets {
    units: Set<IBullet> = new Set();

    constructor() {}

    add(bullet: IBullet) {
        this.units.add(bullet);
    }

    render() {
        for (const bullet of this.units) {
            if (bullet.type === 'laser') {
                bullet.age -= 0.02;

                if (bullet.age <= 0) {
                    this.units.delete(bullet);
                } else {
                    let v = ~~(bullet.age * (70 - Math.cos((70 * Math.PI) / 2)));

                    ctx.strokeStyle = `rgba(255,${v},${v},${bullet.age.toFixed(1)})`;
                    ctx.lineWidth = 1 + v / 6;
                    ctx.lineCap = 'round';

                    ctx.beginPath();
                    ctx.moveTo(bullet.x, bullet.y);
                    ctx.lineTo(bullet.end, bullet.y);
                    ctx.stroke();
                    ctx.closePath();

                    glow(
                        `rgba(255,${v},${v},${bullet.age.toFixed(1)})`,
                        `rgba(255,${v / 2},${v / 2},0)`,
                        bullet.start,
                        bullet.y,
                        v * 2
                    );

                    if (bullet.x <= bullet.end - 50) bullet.x += 50;
                }
            } else if (bullet.type === 'tesla') {
            } else if (bullet.type === 'plasma') {
            }
        }
    }
}

const sounds = new Sounds();
const stars = new Stars();
const bg = new Background();
const score = new Score();
const player = new Player();
const grid = new Grid();
const vignette = new Vignette();
const explosions = new Explosions();
const bullets = new Bullets();

let then = 0;

function render(now: number) {
    const dt = ~~(now - then);
    then = now;

    if (!pause) {
        player.update();
        Enemy.spawn();

        bg.render();
        stars.render();
        Enemy.updateAndRenderAll();
        player.render();
        bullets.render();
        explosions.render();
        grid.render();
        vignette.render();
    }

    requestAnimationFrame(render);
}

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

gameContainer.addEventListener('contextmenu', e => e.preventDefault(), false);
gameContainer.addEventListener('mouseup', gameMouseUp);
gameContainer.addEventListener('mousedown', gameMouseDown);
gameContainer.addEventListener('mousemove', gameMouseMove);
gameContainer.addEventListener('mouseenter', gameMouseEnter);
gameContainer.addEventListener('mouseleave', gameMouseLeave);

requestAnimationFrame(render);
