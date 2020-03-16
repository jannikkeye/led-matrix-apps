import LedMatrix from "easybotics-rpi-rgb-led-matrix";
import { Creature, getOtherIndex } from "./predator-and-prey";

var matrix = new LedMatrix(32, 64, 1, 2, 50, "adafruit-hat", "RGB", [
    "--led-show-refresh",
    "--led-pixel-mapper=U-mapper;Rotate:270",
    "--led-slowdown-gpio=4",
]);

const WIDTH = 32;
const cells = WIDTH * WIDTH;
const creatures: Creature[] = [];

for (let i = 0; i < cells; i++) {
    let x = Math.floor(i % WIDTH);
    let y = Math.floor(i / WIDTH);

    creatures.push(new Creature(i, x, y));
}

function run() {
    const size = 64 / 32;
    creatures.forEach(creature => {
        if (!creature.isNothing()) {
            const other = creatures[getOtherIndex(creature.index, WIDTH, WIDTH)];

            creature.tick(other);

        }
        const x = creature.x * size;
        const y = creature.y * size;

        matrix.fillPixel(
            creature.x * size,
            creature.y * size,
            creature.color[0],
            creature.color[1],
            creature.color[2],
        );
        matrix.fillPixel(
            creature.x * size + 1,
            creature.y * size,
            creature.color[0],
            creature.color[1],
            creature.color[2],
        );
        matrix.fillPixel(
            creature.x * size + 1,
            creature.y * size + 1,
            creature.color[0],
            creature.color[1],
            creature.color[2],
        );
        matrix.fillPixel(
            creature.x * size,
            creature.y * size + 1,
            creature.color[0],
            creature.color[1],
            creature.color[2],
        );
    });
}

setInterval(() => {
    run()
}, 100);