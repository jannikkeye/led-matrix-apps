import Victor from "victor";
import LedMatrix from "easybotics-rpi-rgb-led-matrix";

class World {
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

class Boid {
    position: Victor;
    velocity: Victor;
    acceleration: Victor;
    maxForce: number;
    maxSpeed: number;
    r: number;
    g: number;
    b: number;

    constructor(
        public id: number,
        public world: World,
    ) {
        this.position = new Victor(Math.random() * world.width, Math.random() * world.height);
        this.velocity = new Victor(Math.random() * 2 + 2, Math.random() * 2 + 2);
        this.acceleration = new Victor(0, 0);
        this.maxForce = 1;
        this.maxSpeed = 4;
        this.r = Math.random() * 255;
        this.g = Math.random() * 255;
        this.b = Math.random() * 255;
    }

    edges() {
        // if (this.position.x > this.world.width) {
        //     this.velocity = this.velocity.multiplyScalarX(-1);
        // }
        
        // if (this.position.x < 0.0) {
        //     this.velocity = this.velocity.multiplyScalarX(-1);
        // }
        
        // if (this.position.y > this.world.height) {
        //     this.velocity = this.velocity.multiplyScalarY(-1);
        // }
        
        // if (this.position.y < 0.0) {
        //     this.velocity = this.velocity.multiplyScalarY(-1);
        // }
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
        const perceptionRadius = 50;
        let steering = new Victor(0, 0);
        let total = 0;

        for (let other of boids) {
            const d = this.position.distance(other.position)

            if (this.id !== other.id && d < perceptionRadius) {
                steering = steering.add(other.velocity);

                total += 1;
            }
        }

        if (total > 0) {
            steering = steering.divideScalar(total);
            steering = setMag(steering, this.maxSpeed);
            steering = steering.subtract(this.velocity);
            steering = limit(steering, this.maxForce);
        }

        return steering;
    }

    separation(boids: Boid[]) {
        const perceptionRadius = 50;
        let steering = new Victor(0, 0);
        let total = 0;

        for (let other of boids) {
            const d = this.position.distance(other.position)

            if (this.id !== other.id && d < perceptionRadius) {
                const diff = this.position.subtract(other.position).divideScalar(d * d);

                steering = steering.add(diff);

                total += 1;
            }
        }

        if (total > 0) {
            steering = steering.divideScalar(total);
            steering = setMag(steering ,this.maxSpeed);
            steering = steering.subtract(this.velocity);
            steering = limit(steering, this.maxForce);
        }

        return steering;
    }

    cohesion(boids: Boid[]) {
        const perceptionRadius = 100;
        let steering = new Victor(0, 0);
        let total = 0;

        for (let other of boids) {
            const d = this.position.distance(other.position)

            if (this.id !== other.id && d < perceptionRadius) {
                steering = steering.add(other.position);

                total += 1;
            }
        }

        if (total > 0) {
            steering = steering.divideScalar(total);
            steering = steering.subtract(this.position);
            steering = setMag(steering, this.maxSpeed);
            steering = steering.subtract(this.velocity);
            steering = limit(steering, this.maxForce);
        }

        return steering;
    }

    flock(boids: Boid[]) {
        const alignment = this.align(boids);
        const cohesion = this.cohesion(boids);
        const separation = this.separation(boids);

        this.acceleration = this.acceleration.add(alignment);
        this.acceleration = this.acceleration.add(cohesion);
        this.acceleration = this.acceleration.add(separation);
    }

    update() {
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = limit(this.velocity, this.maxSpeed);
        this.acceleration = this.acceleration.multiplyScalar(0);

        console.log(this.position, this.velocity, this.acceleration);
    }

    draw(matrix: any) {
        matrix.drawCircle(
            Math.floor(this.position.x),
            Math.floor(this.position.y),
            5,
            this.r,
            this.g,
            this.b,
        );
    }
}

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
    boids.forEach(b => b.draw(matrix));
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