import { Vector } from './math/export.js';

export class Camera {
    constructor(
        position = new Vector(0, 0, 0),
        direction = new Vector(0, 0, -1),
        right = new Vector(1, 0, 0),
        field_of_view = Math.PI / 3
    ) {
        this.position = position;
        this.direction = direction;
        this.right = right;
        this.up = direction.cross(right);
        this.field_of_view = field_of_view;
    }
}
