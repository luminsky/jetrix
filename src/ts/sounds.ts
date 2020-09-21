import { masterVolume } from '../main';

export class Sounds {
    units: Map<string, HTMLAudioElement> = new Map();

    constructor() {}

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
