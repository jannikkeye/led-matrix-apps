import { World, Boid } from "~flocking/flocking";
import { Creature, getOtherIndex } from "~predator-and-prey/predator-and-prey";
import { runSquare } from "~/test/square";

const dpr = window.devicePixelRatio || 1;;
const WIDTH = 320;
const HEIGHT = 320;

function startFlocking() {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  document.body.appendChild(canvas);
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const world = new World(WIDTH, HEIGHT);
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

function startPredatorAndPrey() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;

  document.body.appendChild(canvas);
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const WIDTH = 32;
  const cells = WIDTH * WIDTH;
  const creatures: Creature[] = [];

  for (let i = 0; i < cells; i++) {
    let x = Math.floor(i % WIDTH);
    let y = Math.floor(i / WIDTH);

    creatures.push(new Creature(i, x, y));
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    context.fillRect(0, 0, 32, 32);

    creatures.forEach(creature => {
      if (!creature.isNothing()) {
        const other = creatures[getOtherIndex(creature.index, WIDTH, WIDTH)];

        creature.tick(other);

      }

      creature.draw_canvas(context, Math.floor(canvas.width / WIDTH));
    });
  }

  setInterval(() => {
    draw();
  }, 100);
}

function startRotatingSquare() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;

  document.body.appendChild(canvas);
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  function drawPixel(x, y, r, g, b) {
    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    context.fillRect(x * 5, y * 5, 1 * 5, 1 * 5);
  }

  setInterval(() => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    runSquare(drawPixel);
  }, 1000 / 60);
}

startFlocking();
startPredatorAndPrey();
startRotatingSquare();
