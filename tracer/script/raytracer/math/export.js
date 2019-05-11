import { Vector } from './vector.js';

export * from './vector.js';

export function constrain(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

export function flatten(/** @type {Vector[]} */ v_arr) {
    return v_arr
    .map(v => v.toArray())
    .reduce((red, cur) => [...red, ...cur]);
}
