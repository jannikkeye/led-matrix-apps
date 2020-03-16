import LedMatrix from "easybotics-rpi-rgb-led-matrix";
import { World, Boid } from "./flocking";

var matrix = new LedMatrix(32, 64, 1, 2, 75, "adafruit-hat", "RGB", [
    "--led-slowdown-gpio=4",
    "--led-show-refresh",
    "--led-pixel-mapper=U-mapper;Rotate:270",
]);

const world = new World(64, 64);
const boids: Boid[] = [];

for (let i = 0; i < 128; i++) {
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
        matrix.setPixel(
            Math.floor(b.position.x),
            Math.floor(b.position.y),
            b.color[0],
            b.color[1],
            b.color[2],
        );
    });
    matrix.update();
}

function run() {
    setInterval(() => {
        matrix.clear();
        update();
        draw();
    }, Math.round(1000 / 60));
}

run();