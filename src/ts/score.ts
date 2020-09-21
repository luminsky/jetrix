import { scoreEl, sounds } from '../main';

export class Score {
    #count = 0;

    constructor() {}

    get count() {
        return this.#count;
    }

    render(value: number | string = this.#count) {
        scoreEl.textContent = String(value);
    }

    up(amount: number) {
        this.#count += amount;
        this.render();
    }

    clear() {
        this.#count = 0;
        this.render();
        sounds.play('death');
    }

    spend(amount: number) {
        if (this.#count >= amount) {
            this.#count = this.#count - amount;
        } else {
            // not enough points
        }

        this.render();
    }
}
