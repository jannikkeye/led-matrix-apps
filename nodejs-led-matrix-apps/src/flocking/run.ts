import LedMatrix from "easybotics-rpi-rgb-led-matrix";
import { World, Boid } from "./flocking";

var matrix = new LedMatrix(32, 64, 1, 2, 50, "adafruit-hat", "RGB", [
    "--led-show-refresh",
    "--led-pixel-mapper=U-mapper;Rotate:270",
    "--led-slowdown-gpio=4",
]);

const world = new World(64, 64);
const boids: Boid[] = [];

for (let i = 0; i < 2; i++) {
    boids.push(new Boid(i, world));
}

function update() {
    boids.forEach((b) => {
        b.edges();
        b.flock(boids);
        b.update()
    });
}

function draw() {
    boids.forEach(b => {
        matrix.drawCircle(
            Math.floor(b.position.x),
            Math.floor(b.position.y),
            5,
            b.r,
            b.g,
            b.b,
        );
    });
    matrix.update();
}

function run() {
    setInterval(() => {
        matrix.clear();
        update();
        draw();
    }, 200);
}

run();