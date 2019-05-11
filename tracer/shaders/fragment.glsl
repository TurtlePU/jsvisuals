#version 300 es

precision mediump float;

const float INFINITY = 3.4e37;

in vec3 v_position;

uniform vec3 u_cam_position;

const float NONE = 0.0;
const float SPHERE = 1.0;

const uint MAX_SPHERES = uint(64);
uniform uint u_sphere_count;
uniform vec3 u_sphere_position[MAX_SPHERES];
uniform float u_sphere_radius[MAX_SPHERES];
uniform vec3 u_sphere_color[MAX_SPHERES];
uniform float u_sphere_lighting[MAX_SPHERES];
uniform float u_sphere_reflect[MAX_SPHERES];
uniform float u_sphere_ambient[MAX_SPHERES];

const uint MAX_LIGHTS = uint(64);
uniform uint u_light_count;
uniform vec3 u_light_position[MAX_LIGHTS];
uniform float u_light_lum[MAX_LIGHTS];

uniform vec3 u_bg_color;

uniform uint u_max_depth;

vec3 sphere_normal(vec3 point, uint i) {
    return normalize(point - u_sphere_position[i]);
}

float ray_intersection_sphere(vec3 origin, vec3 direction, uint i) {
    vec3 center = u_sphere_position[i] - origin;
    float proj_length = dot(center, direction);
    float distance_squared = dot(center, center) - proj_length * proj_length;
    float radius = u_sphere_radius[i];
    if (distance_squared > radius * radius) {
        return INFINITY;
    }
    float proj_offset = sqrt(radius * radius - distance_squared);
    return proj_length - proj_offset;
}

// x for distance, y for object type, z for object index
vec3 intersect(vec3 origin, vec3 direction) {
    vec3 ans = vec3(INFINITY, NONE, 0);
    for (uint i = uint(0); i != u_sphere_count; ++i) {
        float dist = ray_intersection_sphere(origin, direction, i);
        if (dist > 0.0 && dist < ans.x) {
            ans = vec3(dist, SPHERE, i);
        }
    }
    return ans;
}

bool is_visible(vec3 point, vec3 eye) {
    return intersect(point, normalize(eye - point)).x >= length(eye - point);
}

vec3 surface_sphere(vec3 direction, vec3 point, uint i) {
    float lambertian = 0.0;
    if (u_sphere_lighting[i] != 0.0) {
        vec3 normal = sphere_normal(point, i);
        for (uint j = uint(0); j != u_light_count; ++j) {
            if (is_visible(point, u_light_position[j])) {
                float amount = dot(normal, normalize(u_light_position[j] - point));
                if (amount > 0.0) {
                    lambertian += amount;
                }
            }
        }
    }
    lambertian = min(1.0, lambertian);
    return u_sphere_color[i] * (
        lambertian * u_sphere_lighting[i] + u_sphere_ambient[i]
    );
}

vec3 trace(vec3 origin, vec3 direction) {
    vec3 result = vec3(0, 0, 0);
    float reflection = 1.0;
    for (uint depth = uint(0); depth != u_max_depth; ++depth) {
        vec3 intersection = intersect(origin, direction);
        if (intersection.x == INFINITY) {
            result +=
                reflection *
                u_bg_color;
            break;
        }
        vec3 point = origin + direction * intersection.x;
        if (intersection.y == SPHERE) {
            uint i = uint(intersection.z);
            result +=
                reflection *
                surface_sphere(direction, point, i);
            reflection *= u_sphere_reflect[i];
            if (reflection < 0.0001) {
                break;
            }
            origin = point;
            direction = reflect(direction, sphere_normal(point, i));
        }
    }
    return result;
}

out vec4 color;

void main(void) {
    color = vec4(trace(u_cam_position, normalize(v_position)), 1);
}
