import { Vector } from '../math/export.js';
import { RenderingFeatures } from '../features.js';

export class TracedObject {
    constructor(
        type = 'object',
        position = new Vector(),
        rendering_features = new RenderingFeatures()
    ) {
        this.type = type;
        this.position = position;
        this.rendering_features = rendering_features;
    }
}
