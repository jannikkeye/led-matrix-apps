import LedMatrix from "easybotics-rpi-rgb-led-matrix";
import { runSquare } from "./square";

var matrix = new LedMatrix(32, 64, 1, 2, 100, "adafruit-hat", "RGB", [
    "--led-show-refresh",
    "--led-pixel-mapper=U-mapper;Rotate:270",
    "--led-slowdown-gpio=4",
]);

function drawPixel(x, y, r, g, b) {
    matrix.setPixel(x, y,
        r,
        g,
        b
    );

}

setInterval(() => {
    runSquare(drawPixel);
    matrix.update();
}, 1000 / 60);