import { World, Boid } from "~flocking/flocking";
const WIDTH = 64;
const HEIGHT = 64;

function startFlocking() {
  const dpr = window.devicePixelRatio || 1;;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;

  document.body.appendChild(canvas);
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const world = new World(WIDTH * dpr, HEIGHT * dpr);
  const boids: Boid[] = [];

  for (let i = 0; i < 100; i++) {
    boids.push(new Boid(i, world));
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let boid of boids) {
      boid.edges();
      boid.flock(boids);
      boid.update();
      boid.draw_canvas(context);
    }
  }

  setInterval(() => {
    draw();
  }, 32);
}

startFlocking();
