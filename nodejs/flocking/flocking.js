"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var victor_1 = __importDefault(require("victor"));
var easybotics_rpi_rgb_led_matrix_1 = __importDefault(require("easybotics-rpi-rgb-led-matrix"));
var World = /** @class */ (function () {
    function World(width, height) {
        this.width = width;
        this.height = height;
    }
    return World;
}());
function setMag(v, max) {
    return v.normalize().multiplyScalar(max);
}
function limit(v, max) {
    var mag = v.magnitude();
    if (mag > max) {
        return v.divideScalar(mag * max);
    }
    return v;
}
var Boid = /** @class */ (function () {
    function Boid(id, world) {
        this.id = id;
        this.world = world;
        this.position = new victor_1.default(Math.random() * world.width, Math.random() * world.height);
        this.velocity = new victor_1.default(Math.random() * 2 + 2, Math.random() * 2 + 2);
        this.acceleration = new victor_1.default(0, 0);
        this.maxForce = 1;
        this.maxSpeed = 4;
        this.r = Math.random() * 255;
        this.g = Math.random() * 255;
        this.b = Math.random() * 255;
    }
    Boid.prototype.edges = function () {
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
    };
    Boid.prototype.align = function (boids) {
        var perceptionRadius = 50;
        var steering = new victor_1.default(0, 0);
        var total = 0;
        for (var _i = 0, boids_1 = boids; _i < boids_1.length; _i++) {
            var other = boids_1[_i];
            var d = this.position.distance(other.position);
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
    };
    Boid.prototype.separation = function (boids) {
        var perceptionRadius = 50;
        var steering = new victor_1.default(0, 0);
        var total = 0;
        for (var _i = 0, boids_2 = boids; _i < boids_2.length; _i++) {
            var other = boids_2[_i];
            var d = this.position.distance(other.position);
            if (this.id !== other.id && d < perceptionRadius) {
                var diff = this.position.subtract(other.position).divideScalar(d * d);
                steering = steering.add(diff);
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
    };
    Boid.prototype.cohesion = function (boids) {
        var perceptionRadius = 100;
        var steering = new victor_1.default(0, 0);
        var total = 0;
        for (var _i = 0, boids_3 = boids; _i < boids_3.length; _i++) {
            var other = boids_3[_i];
            var d = this.position.distance(other.position);
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
    };
    Boid.prototype.flock = function (boids) {
        var alignment = this.align(boids);
        var cohesion = this.cohesion(boids);
        var separation = this.separation(boids);
        this.acceleration = this.acceleration.add(alignment);
        this.acceleration = this.acceleration.add(cohesion);
        this.acceleration = this.acceleration.add(separation);
    };
    Boid.prototype.update = function () {
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = limit(this.velocity, this.maxSpeed);
        this.acceleration = this.acceleration.multiplyScalar(0);
        console.log(this.position, this.velocity, this.acceleration);
    };
    Boid.prototype.draw = function (matrix) {
        matrix.drawCircle(Math.floor(this.position.x), Math.floor(this.position.y), 5, this.r, this.g, this.b);
    };
    return Boid;
}());
var matrix = new easybotics_rpi_rgb_led_matrix_1.default(32, 64, 1, 2, 50, "adafruit-hat", "RGB", [
    "--led-show-refresh",
    "--led-pixel-mapper=U-mapper;Rotate:270",
    "--led-slowdown-gpio=4",
]);
var world = new World(64, 64);
var boids = [];
for (var i = 0; i < 2; i++) {
    boids.push(new Boid(i, world));
}
function update() {
    boids.forEach(function (b) {
        b.edges();
        b.flock(boids);
        b.update();
    });
}
function draw() {
    boids.forEach(function (b) { return b.draw(matrix); });
    matrix.update();
}
function run() {
    setInterval(function () {
        matrix.clear();
        update();
        draw();
    }, 200);
}
run();
