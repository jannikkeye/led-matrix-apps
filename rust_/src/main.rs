use rust_rpi_led_matrix::{LedMatrix, LedMatrixOptions};

fn main() {
    let mut led_matrix_options = LedMatrixOptions::new();

    let led_matrix = LedMatrix::new(led_matrix_options);
}
