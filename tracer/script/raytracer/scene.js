import { Camera } from './camera.js';

import { constrain, Vector } from './math/export.js';
import { Light } from './light.js';
import { RenderingFeatures } from './features.js';
import { Sphere, TracedObject } from './primitives/export.js';

export class Scene {
    constructor(
        camera = new Camera(),
        objects = [],
        light_sources = [],
        background_features = new RenderingFeatures(),
        max_depth = 3
    ) {
        this.camera = camera;
        /** @type {TracedObject[]} */
        this.objects = objects;
        /** @type {Light[]} */
        this.light_sources = light_sources;
        this.background_features = background_features;
        this.max_depth = max_depth;
    }

    getUniforms() {
        /** @type {Sphere[]} */
        let spheres = this.objects.filter(obj => obj.type == 'Sphere');
        return {
            u_cam_position: this.camera.position.toArray(),

            u_sphere_count: spheres.length,
            u_sphere_position: spheres.map(sph => sph.position.toArray()),
            u_sphere_radius: spheres.map(sph => sph.radius),
            u_sphere_color: spheres.map(sph => sph.rendering_features.color.toArray()),
            u_sphere_lighting: spheres.map(sph => sph.rendering_features.lighting),
            u_sphere_reflect: spheres.map(sph => sph.rendering_features.reflective),
            u_sphere_ambient: spheres.map(sph => sph.rendering_features.ambient),

            u_light_count: this.light_sources.length,
            u_light_position: this.light_sources.map(src => src.position.toArray()),
            u_light_lum: this.light_sources.map(src => src.luminosity),

            u_bg_color: this.background_features.color.toArray(),
            u_bg_lighting: this.background_features.lighting,
            u_bg_reflect: this.background_features.reflective,
            u_bg_ambient: this.background_features.ambient,

            u_max_depth: this.max_depth,
        }
    }

    getPlotPosition(width, height) {
        let half_width = Math.tan(this.camera.field_of_view);
        let half_height = half_width * height / width;

        let right = this.camera.right.scale(half_width);
        let up = this.camera.up.scale(half_height);

        let direction = new Array(4).map((_, i) =>
            this.camera.direction
                .add(i % 2 ? right.negate() : right)
                .add(i < 2 ? up.negate() : up)
            .normalize()
        );
        return direction
            .map(v => v.toArray())
            .reduce((red, cur) => [...red, ...cur]);
    }

    render(width, height) {
        let data = new Uint8ClampedArray(4 * width * height);
        let half_width = Math.tan(this.camera.field_of_view);
        let half_height = half_width * height / width;
        let camera_width = half_width * 2;
        let camera_height = half_height * 2;
        let pixel_width = camera_width / (width - 1);
        let pixel_height = camera_height / (height - 1);

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                let right = this.camera.right.scale(x * pixel_width - half_width);
                let up = this.camera.up.scale(y * pixel_height - half_height);

                let direction = this.camera.direction.add(right).add(up).normalize();

                let color = this.trace(this.camera.position, direction);
                color.x = constrain(color.x, 0, 255);
                color.y = constrain(color.y, 0, 255);
                color.z = constrain(color.z, 0, 255);

                data[4 * (x + y * width) + 0] = color.x;
                data[4 * (x + y * width) + 1] = color.y;
                data[4 * (x + y * width) + 2] = color.z;
                data[4 * (x + y * width) + 3] = 255;
            }
        }
        return data;
    }

    trace(origin, direction, depth = 0) {
        // direction should be unit-length vector
        if (depth === this.max_depth) {
            return new Vector();
        }
        let closest = this.intersect(origin, direction);
        if (closest[0] === Infinity) {
            return this.background_features.color;
        }
        let point = origin.add(direction.scale(closest[0]));
        return this.surface(direction, closest[1], point, depth);
    }

    intersect(origin, direction, skip = []) {
        let closest = [Infinity, null];
        for (let i = 0; i < this.objects.length; ++i) {
            if (skip.includes(i)) {
                continue;
            }
            let distance = this.objects[i].ray_intersection(origin, direction);
            if (distance > 0 && distance < closest[0]) {
                closest = [distance, i];
            }
        }
        return closest;
    }

    surface(direction, object_index, point, depth) {
        if (depth === this.max_depth) {
            return new Vector();
        }
        let object = this.objects[object_index];
        let color = new Vector();
        let lambertian = 0;
        let normal = object.normal(point);
        if (object.rendering_features.lighting !== 0) {
            for (let i = 0; i < this.light_sources.length; ++i) {
                let source = this.light_sources[i].position;
                if (this.is_visible(point, source, [object_index])) {
                    let amount = normal.dot(source.subtract(point).normalize());
                    if (amount > 0) {
                        lambertian += amount;
                    }
                }
            }
        }
        lambertian = Math.min(1, lambertian);
        let reflected = direction.negate().reflect(normal);
        if (object.rendering_features.reflective !== 0) {
            let reflected_color = this.trace(point, reflected, depth + 1);
            color = color.add(reflected_color.scale(object.rendering_features.reflective));
        }
        color = color.add(
            object.rendering_features.color.scale(
                lambertian * object.rendering_features.lighting
                )
        ).add(
            object.rendering_features.color.scale(
                object.rendering_features.ambient
            )
        );
        return color;
    }

    is_visible(point, light_source, skip = []) {
        let p = this.intersect(point, light_source.subtract(point).normalize(), skip);
        return p[0] === Infinity;
    }
}
