import { Camera } from './camera.js';

import { RenderingFeatures } from './util.js';
import { SPHERE_TYPE } from './primitives/export.js';

const MAX_SPHERES = 64;
const MAX_LIGHTS = 64;

export class Scene {
    constructor(
        camera = new Camera(),
        objects = [],
        light_sources = [],
        background_features = new RenderingFeatures(),
        max_depth = 3
    ) {
        this.camera = camera;
        this.objects = objects;
        this.light_sources = light_sources;
        this.background_features = background_features;
        this.max_depth = max_depth;
    }

    getUniforms() {
        let spheres = this.objects.filter(obj => obj.type === SPHERE_TYPE);
        return {
            u_cam_position: this.camera.position.toArray(),

            u_sphere_count: spheres.length,
            u_sphere_position: fitsize(
                flatten(spheres.map(sph => sph.position)), MAX_SPHERES * 3
            ),
            u_sphere_radius: fitsize(
                spheres.map(sph => sph.radius), MAX_SPHERES
            ),
            u_sphere_color: fitsize(
                flatten(spheres.map(sph => sph.rendering_features.color)), MAX_SPHERES * 3
            ).map(c => c / 255),
            u_sphere_lighting: fitsize(
                spheres.map(sph => sph.rendering_features.lighting), MAX_SPHERES
            ),
            u_sphere_reflect: fitsize(
                spheres.map(sph => sph.rendering_features.reflective), MAX_SPHERES
            ),
            u_sphere_ambient: fitsize(
                spheres.map(sph => sph.rendering_features.ambient), MAX_SPHERES
            ),

            u_light_count: this.light_sources.length,
            u_light_position: fitsize(
                flatten(this.light_sources.map(src => src.position)), MAX_LIGHTS * 3
            ),
            u_light_lum: fitsize(
                this.light_sources.map(src => src.luminosity), MAX_LIGHTS
            ),

            u_bg_color: this.background_features.color.toArray().map(c => c / 255),

            u_max_depth: this.max_depth,
        }
    }

    getPlotPosition(width, height) {
        let half_width = Math.tan(this.camera.field_of_view);
        let half_height = half_width * height / width;

        let right = this.camera.right.scale(half_width);
        let up = this.camera.up.scale(half_height);

        let direction = new Array(4).fill('').map((_, i) => 
            this.camera.direction
            .add(i % 2 ? right.negate() : right)
            .add(i < 2 ? up : up.negate())
            .normalize()
        );
        return flatten(direction);
    }
}

function flatten(v_arr) {
    return v_arr
    .map(v => v.toArray())
    .reduce((red, cur) => [...red, ...cur]);
}

function fitsize(
    /** @type {any[]} */ arr,
    /** @type {number} */ size
) {
    return [...arr, ...new Array(size - arr.length).fill(0)];
}
