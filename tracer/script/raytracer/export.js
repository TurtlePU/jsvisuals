export * from './camera.js';
export * from './light.js';
export * from './scene.js';
export * from './utils.js';

import * as RayTracerMath from './math/export.js';
export const math = RayTracerMath;

import * as RayTracerPrimitives from './primitives/export.js';
export const primitives = RayTracerPrimitives;
