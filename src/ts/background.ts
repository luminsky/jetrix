import { ctx, height, score, width } from '../main';

export interface IStar {
    x: number;
    y: number;
    color?: string;
    speed?: number;
    opacity?: number;
    tailLength?: number;
}

export interface IStarOptions {
    color: string;
    speed: number;
    opacity: number;
    tailLength: number;
    spaceDepth: number;
    x?: number;
}

export class Background {
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

export class Stars {
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
