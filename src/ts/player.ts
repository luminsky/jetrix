import { bullets, ctx, fit, height, mouseX, mouseY, score, sounds, sprites, width } from '../main';
import { IBullet } from './bullets';
import { Enemy } from './enemy';

export class Player {
    x = 0;
    y = 0;
    width: number;
    height: number;
    gun = 'laser';
    sprite = 'player-1';
    flameFrame = 0;
    speed = 250;

    constructor() {
        this.width = 100;
        this.height = 70;
        this.x = mouseX;
        this.y = mouseY;
    }

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
