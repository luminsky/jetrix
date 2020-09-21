import { glow } from '../main';

export interface IExplosion {
    x: number;
    y: number;
    age: number;
}

export class Explosions {
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
