function rotate(x, y, angle) {
    return {
        new_x: x * Math.cos(angle) - y * Math.sin(angle),
        new_y: x * Math.sin(angle) + y * Math.cos(angle),
    };
}

const WIDTH = 64;

function scale_col(val, lo, hi) {
    if (val < lo) return 0;
    if (val > hi) return 255;
    return 255 * (val - lo) / (hi - lo);
}

const cent_x = WIDTH / 2;
const cent_y = WIDTH / 2;

// The square to rotate (inner square + black frame) needs to cover the
// whole area, even if diagonal. Thus, when rotating, the outer pixels from
// the previous frame are cleared.
const rotate_square = Math.min(WIDTH, WIDTH) * 1.41;
const min_rotate = cent_x - rotate_square / 2;
const max_rotate = cent_x + rotate_square / 2;

// The square to display is within the visible area.
const display_square = Math.min(WIDTH, WIDTH) * 0.7;
const min_display = cent_x - display_square / 2;
const max_display = cent_x + display_square / 2;

const deg_to_rad = 2 * 3.14159265 / 360;
let rotation = 0;

export function runSquare(drawPixel: (x: number, y: number, r: number, g: number, b: number) => void) {
    rotation++;

    rotation %= 360;

    for (let x = min_rotate; x < max_rotate; x++) {
        for (let y = min_rotate; y < max_rotate; y++) {
            let { new_x: rot_x, new_y: rot_y } = rotate(x - cent_x, y - cent_x, deg_to_rad * rotation);

            if (x >= min_display && x < max_display &&
                y >= min_display && y < max_display) { // within display square
                const r = scale_col(x, min_display, max_display);
                const g = 255 - scale_col(y, min_display, max_display);
                const b = scale_col(y, min_display, max_display);

                drawPixel(rot_x + cent_x, rot_y + cent_y, r, g, b);
            } else {
                drawPixel(rot_x + cent_x, rot_y + cent_y, 0, 0, 0);
            }
        }
    }
}