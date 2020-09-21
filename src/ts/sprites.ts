import {} from '../main';

export interface ISprite {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Sprites {
    list: Map<string, ISprite> = new Map();
    canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private image: HTMLImageElement;

    constructor(src: string) {
        this.image = new Image();
        this.image.src = src;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.image.width * 10;
        this.canvas.height = this.image.height * 10;
        this.ctx = this.canvas.getContext('2d');

        this.ctx.drawImage(
            this.image,
            0,
            0,
            this.image.width,
            this.image.height,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    set(name: string, sprite: ISprite) {
        this.list.set(name, sprite);
    }

    get(name: string) {
        return this.list.get(name);
    }
}
