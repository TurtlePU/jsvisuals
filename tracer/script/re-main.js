import * as twgl from './lib/twgl.js';

var gl;
var scene;

window.onload = async () => {
    gl = twgl.getContext(
        document.getElementById('canvas')
    );

    let camera_pos = new Vector(5, 0, -1);
    let sun_pos = new Vector(0, 0, -2);
    scene = new Scene(
        new Camera(
            camera_pos,
            sun_pos
                .subtract(camera_pos)
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
                sun_pos,
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

    init_drawing();
};

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
