import {
    ctx,
    explosions,
    fit,
    gameCanvas,
    height,
    player,
    score,
    sounds,
    sprites,
    width,
} from '../main';

import { IExplosion } from './explosions';

export class Enemy {
    static units: Set<Enemy> = new Set();

    x = width;
    y = 0;
    width: number;
    height: number;
    sprite = 'enemy-1';
    speed = 5;

    constructor(y: number) {
        this.width = 100;
        this.height = 70;
        this.y = y;
    }

    static spawn(y: number) {
        this.units.add(new this(y));
    }

    static trySpawn() {
        if (Math.random() * 100 > 100 - (1 + ~~(score.count / 1000))) {
            this.spawn(fit(Math.random() * (height - 100) + 50));
        }
    }

    static updateAll() {
        for (const unit of Enemy.units) {
            unit.update();
        }
    }

    static renderAll() {
        for (const unit of Enemy.units) {
            unit.render();
        }
    }

    update() {
        if (this.x <= -this.width) {
            this.kill();
            score.clear();
        } else {
            this.x -= this.speed + ~~(score.count / 150);
        }

        // collision
        if (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        ) {
            this.kill();
            score.clear();
        }
    }

    render() {
        ctx.drawImage(sprites, 10, 0, 10, 7, ~~this.x, ~~this.y, 100, 70);
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
