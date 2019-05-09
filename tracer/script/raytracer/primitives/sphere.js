import { Vector } from '../math/export.js';
import { RenderingFeatures } from '../features.js';
import { TracedObject } from './object.js';

export class Sphere extends TracedObject {
    constructor(
        position = new Vector(),
        radius = 1,
        rendering_features = new RenderingFeatures()
    ) {
        super('Sphere', position, rendering_features);
        this.radius = radius;
    }

    ray_intersection(origin, direction) {
        // direction should be unit-length vector
        let center = this.position.subtract(origin);
        let proj_length = center.dot(direction);
        let distance_squared = center.norm_squared() - proj_length * proj_length;
        if (distance_squared > this.radius * this.radius) {
            return Infinity;
        }
        let proj_offset = Math.sqrt(this.radius * this.radius - distance_squared);
        return proj_length - proj_offset;  // proj_length + proj_offset --- is the other intersection point 
    }

    normal(point) {
        return point.subtract(this.position).normalize();
    }
}
