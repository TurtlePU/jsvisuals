import { Vector } from '../math/export.js';
import { RenderingFeatures } from '../util.js';

export const OBJECT_TYPE = 'Object';

export class TracedObject {
    constructor(
        type = OBJECT_TYPE,
        position = new Vector(),
        rendering_features = new RenderingFeatures()
    ) {
        this.type = type;
        this.position = position;
        this.rendering_features = rendering_features;
    }
}
