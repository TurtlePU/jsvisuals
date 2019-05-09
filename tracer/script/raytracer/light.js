import { Vector } from './math/export.js';

export class Light {
    constructor(position = new Vector(), luminosity = 1) {
        this.position = position;
        this.luminosity = luminosity;
    }
}
