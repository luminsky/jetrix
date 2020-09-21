import { ctx, gameCanvas, height, width } from '../main';

export class Grid {
    canvas: HTMLCanvasElement = document.createElement('canvas');
    ctx: CanvasRenderingContext2D;
    patterns: Map<string, CanvasPattern> = new Map();

    constructor() {
        this.canvas;
        this.canvas.width = gameCanvas.width;
        this.canvas.height = gameCanvas.height;
        this.ctx = this.canvas.getContext('2d');

        this.add('pix', '../assets/img/pixpat.png').then(() => {
            this.set('pix');
        });

        this.add('cell', '../assets/img/cellpat.png');
        this.add('dot', '../assets/img/dotpat.png');
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

export class Vignette {
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
