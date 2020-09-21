export interface IStar {
    x: number;
    y: number;
    color?: string;
    speed?: number;
    opacity?: number;
    tailLength?: number;
}

export interface IExplosion {
    x: number;
    y: number;
    age: number;
}

export interface IBullet {
    x: number;
    y: number;
    start: number;
    end: number;
    age: number;
    type: string;
}

export interface IStarOptions {
    color: string;
    speed: number;
    opacity: number;
    tailLength: number;
    spaceDepth: number;
    x?: number;
}
