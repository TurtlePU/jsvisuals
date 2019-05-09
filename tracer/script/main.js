import {
    Camera,
    primitives,
    math,
    RenderingFeatures,
    Scene,
    Light
} from './raytracer/export.js';

const { Vector } = math;
const { Sphere } = primitives;

var canvas;
var width, height;
var context_2d;

var scene;

var playing;
var prev;

window.onload = async () => {
    canvas = document.getElementById('canvas');
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    context_2d = canvas.getContext('2d');

    let position = new Vector(5, 0, -1);
    scene = new Scene(
        new Camera(
            position,
            new Vector(0, 0, -1)
                .subtract(position)
                .normalize(),
            new Vector(0, 0, -1)
        ),
        [
            new Sphere(
                new Vector(-1, 0, -2),
                0.3,
                new RenderingFeatures(
                    new Vector(255, 0, 0),
                    1.0,
                    0.5,
                    0.0
                )
            ),
            new Sphere(
                new Vector(0, 0, -2),
                0.5,
                new RenderingFeatures(
                    new Vector(0, 0, 255),
                    1.0,
                    0.9,
                    0.3
                )
            )
        ],
        [
            new Light(new Vector(100, 0, 0)),
        ]
    );

    playing = true;
    draw(prev = performance.now());
};

function draw(time) {
    update(time - prev);
    prev = time;
    render();
    if (playing) {
        requestAnimationFrame(draw);
    }
};

function update(dt) {
    scene.objects[0].position =
        scene.objects[0].position.rotateZ(dt * 0.01 * 60 / 1000);
}

function render() {
    context_2d.putImageData(
        new ImageData(
            scene.render(width, height),
            width,
            height
        ), 0, 0
    );
}
