import { Vector } from '../math/export.js';
import { RenderingFeatures } from '../util.js';
import { TracedObject } from './object.js';

export const SPHERE_TYPE = 'Sphere';

export class Sphere extends TracedObject {
    constructor(
        position = new Vector(),
        radius = 1,
        rendering_features = new RenderingFeatures()
    ) {
        super(SPHERE_TYPE, position, rendering_features);
        this.radius = radius;
    }
}
