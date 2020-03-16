import Victor from "victor";
// import LedMatrix from "easybotics-rpi-rgb-led-matrix";

export class World {
  constructor(public width: number, public height: number) {}
}

function setMag(v: Victor, max: number) {
  return v.normalize().multiplyScalar(max);
}

function limit(v: Victor, max: number): Victor {
  let mag = v.magnitude();

  if (mag > max) {
    return v.divideScalar(mag * max);
  }

  return v;
}

function createColor(min: number = 0, max: number = 255): [number, number, number] {
  return [
      Math.floor(Math.min(min, Math.random() * max)),
      Math.floor(Math.min(Math.random() * max + min)),
      Math.floor(Math.min(Math.random() * max)),
  ];
}

export class Boid {
  position: Victor;
  velocity: Victor;
  acceleration: Victor;
  maxForce: number;
  maxSpeed: number;
  color: [number, number, number];

  constructor(public id: number, public world: World) {
    this.position = new Victor(
      Math.random() * world.width,
      Math.random() * world.height
    );
    this.velocity = new Victor(Math.random(), Math.random());
    this.acceleration = new Victor(0, 0);
    this.maxForce = 1;
    this.maxSpeed = 2;
    this.color = createColor(0, 200);


    this.colorChange();
  }

  colorChange() {
    setInterval(() => {
      this.color = createColor(200, 255);
    }, Math.floor(Math.random() * 1000 + 1000));
  }

  edges() {
    if (this.position.x > this.world.width) {
      this.position.x = 0.0;
    }

    if (this.position.x < 0.0) {
      this.position.x = this.world.width;
    }

    if (this.position.y > this.world.height) {
      this.position.y = 0.0;
    }

    if (this.position.y < 0.0) {
      this.position.y = this.world.height;
    }
  }

  align(boids: Boid[]) {
    const perceptionRadius = 32;
    let steering = new Victor(0, 0);
    let total = 0;

    for (let other of boids) {
      const d = this.position.distance(other.position);

      if (this.id !== other.id && d < perceptionRadius) {
        steering.add(other.velocity);

        total += 1;
      }
    }

    if (total > 0) {
      steering.divideScalar(total);
      steering = setMag(steering, this.maxSpeed);
      steering.subtract(this.velocity);
      steering = limit(steering, this.maxForce);
    }

    return steering;
  }

  separation(boids: Boid[]) {
    const perceptionRadius = 32;
    let steering = new Victor(0, 0);
    let total = 0;

    for (let other of boids) {
      const d = this.position.distance(other.position);

      if (this.id !== other.id && d < perceptionRadius) {
        const diff = this.position.clone().subtract(other.position).divideScalar(d * d);

        steering.add(diff);

        total += 1;
      }
    }

    if (total > 0) {
      steering.divideScalar(total);
      steering = setMag(steering, this.maxSpeed);
      steering.subtract(this.velocity);
      steering = limit(steering, this.maxForce);
    }

    return steering;
  }

  cohesion(boids: Boid[]) {
    const perceptionRadius = 16;
    let steering = new Victor(0, 0);
    let total = 0;

    for (let other of boids) {
      const d = this.position.distance(other.position);

      if (this.id !== other.id && d < perceptionRadius) {
        steering.add(other.position);

        total += 1;
      }
    }

    if (total > 0) {
      steering.divideScalar(total);
      steering.subtract(this.position);
      steering = setMag(steering, this.maxSpeed);
      steering.subtract(this.velocity);
      steering = limit(steering, this.maxForce);
    }

    return steering;
  }

  flock(boids: Boid[]) {
    const alignment = this.align(boids);
    const cohesion = this.cohesion(boids);
    const separation = this.separation(boids);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity = limit(this.velocity, this.maxSpeed);
    this.acceleration = new Victor(0, 0);
  }

  draw_canvas(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgb(${Math.floor(this.color[0])}, ${Math.floor(
      this.color[1]
    )}, ${Math.floor(this.color[2])})`;
    // ctx.arc(
    //   Math.floor(this.position.x),
    //   Math.floor(this.position.y),
    //   2,
    //   0,
    //   360
    // );
    ctx.fillRect(
      Math.floor(this.position.x),
      Math.floor(this.position.y),
      2,
      2
    );
  }
}
