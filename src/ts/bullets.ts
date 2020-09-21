import { ctx, glow } from '../main';

export interface IBullet {
    x: number;
    y: number;
    start: number;
    end: number;
    age: number;
    type: string;
}

export class Bullets {
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
