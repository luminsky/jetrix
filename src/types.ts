export interface IStar {
    x: number;
    color?: string;
    speed?: number;
    opacity?: number;
    tailLength?: number;
}

export interface IExplosion {
    x: number;
    y: number;
    age: number;
    id: number;
}

export interface IBullet {
    x: number;
    y: number;
    start: number;
    end: number;
    age: number;
    id: number;
    type: string;
}

export interface ISounds {}

export interface IParticle {}

export interface IPlayer {}

export interface IEnemy {}
