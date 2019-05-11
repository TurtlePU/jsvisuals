import * as twgl from './external/twgl.js';

import {
    math,
    primitives,
    Camera,
    Light,
    Scene,
} from './raytracer/export.js';

window.onload = async () => {
    await init_gl();
    init_scene();
    init_drawing();
};

var gl;
var program_info;
var buffer_info;

async function init_gl() {
    gl = twgl.getContext(
        document.getElementById('canvas')
    );

    program_info = twgl.createProgramInfo(gl, [
        await getText('shaders/vertex.glsl'),
        await getText('shaders/fragment.glsl')
    ]);
    gl.useProgram(program_info.program);

    twgl.setAttributePrefix('a_');

    buffer_info = twgl.createBufferInfoFromArrays(gl, {
        vertex_position: {
            data: [
                1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                -1.0, -1.0
            ],
            numComponents: 2
        },
        plot_position: {
            data: [],
            numComponents: 3
        }
    });
}

var scene;

function init_scene() {
    let camera_pos = new math.Vector(5, 0, -1);
    let sun_pos = new math.Vector(0, 0, -2);
    scene = new Scene(
        new Camera(
            camera_pos,
            sun_pos
                .subtract(camera_pos)
                .normalize(),
            new math.Vector(0, 0, -1)
        ),
        [
            new primitives.Sphere(
                new math.Vector(-1, 0, -2),
                0.3,
                {
                    color: new math.Vector(255, 0, 0),
                    lighting: 1.0,
                    reflective: 0.5,
                    ambient: 0.0
                }
            ),
            new primitives.Sphere(
                sun_pos,
                0.5,
                {
                    color: new math.Vector(0, 0, 255),
                    lighting: 1.0,
                    reflective: 0.9,
                    ambient: 0.3
                }
            )
        ],
        [
            new Light(new math.Vector(100, 0, 0)),
        ]
    );
}

function init_drawing() {
    let playing = true;
    let prev;
    (function draw(time) {
        update(time - prev);
        prev = time;
        render();
        if (playing) {
            requestAnimationFrame(draw);
        }
    })(prev = performance.now());
}

function update(dt) {
    scene.objects[0].position =
        scene.objects[0].position.rotateZ(dt * 0.0006);
}

function render() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    twgl.setAttribInfoBufferFromArray(gl,
        buffer_info.attribs.a_plot_position,
        scene.getPlotPosition(gl.canvas.width, gl.canvas.height)
    );
    twgl.setBuffersAndAttributes(gl, program_info, buffer_info);
    twgl.setUniforms(program_info, scene.getUniforms());
    twgl.drawBufferInfo(gl, buffer_info, gl.TRIANGLE_STRIP);
}

async function getText(path) {
    return (await fetch(path)).text();
}
