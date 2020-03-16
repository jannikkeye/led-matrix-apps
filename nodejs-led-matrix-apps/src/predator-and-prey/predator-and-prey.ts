const REPRODUCTION_THRESHOLD = 4;
enum Kind {
    Nothing = 0,
    Predator = 1,
    Prey = 2
}

function createColor(min: number = 0, max: number = 255): [number, number, number] {
    return [
        Math.floor(Math.min(min, Math.random() * max)),
        Math.floor(Math.min(Math.random() * max + min)),
        Math.floor(Math.min(Math.random() * max)),
    ];
}

let PREY_COLOR = createColor(100);
let PREDATOR_COLOR = createColor(100);
let NOTHING_COLOR: [number, number, number] = createColor(0, 50);

setInterval(() => {
    PREY_COLOR = createColor(100);
    PREDATOR_COLOR = createColor(100);
    NOTHING_COLOR = createColor(0, 50);
}, 2000);

export class Creature {
    kind: Kind;
    health: number;
    reproductionThreshold: number = REPRODUCTION_THRESHOLD;
    color: [number, number, number];


    constructor(public index: number, public x: number, public y: number) {
        const kind = Math.floor(Math.random() * 3);

        if (kind === 0) {
            this.kind = Kind.Nothing;
            this.health = 0;
            this.color = NOTHING_COLOR
        } else if (kind === 1) {
            this.kind = Kind.Predator;
            this.health = 5;
            this.color = PREDATOR_COLOR;
        } else {
            this.kind = Kind.Prey;
            this.health = 1;
            this.color = PREY_COLOR;
        }
    }

    isPrey() {
        return this.kind === Kind.Prey;
    }

    isPredator() {
        return this.kind === Kind.Predator;
    }

    isNothing() {
        return this.kind === Kind.Nothing;
    }

    toNothing() {
        this.kind = Kind.Nothing;
        this.color = NOTHING_COLOR;
    }
    toPrey() {
        this.kind = Kind.Prey;
        this.health = 1;
        this.color = PREY_COLOR;
    }
    toPredator() {
        this.kind = Kind.Predator;
        this.health = 5;
        this.color = PREDATOR_COLOR;
    }

    heal() {
        this.health += 1;
    }

    bleed() {
        this.health -= 1;
    }

    tryMove(other: Creature) {
        if (this.isPredator()) {
            this.bleed();
            
            if (this.health <= 0) {
                this.toNothing();
                
                return;
            }
            
            if (other.isPrey()) {
                this.health += other.health;
                
                if (this.health > this.reproductionThreshold) {
                    this.health = 5;
                }
                
                other.toPredator();
                
                return;
            }
        }
        
        if (this.isPrey()) {
            this.heal();
            
            if (this.health >= this.reproductionThreshold && other.isNothing()) {
                this.health = 1;
                other.toPrey();
                
                return;
            }
        }
        
        if (other.isNothing()) {
            other.kind = this.kind;
            other.health = this.health;
            
            this.toNothing();
        }
    }

    tick(other: Creature) {
        if (this.isNothing()) {
            return;
        }

        if (Math.random() > 0.75) {
            this.tryMove(other);
        }

    }

    draw_canvas(context: CanvasRenderingContext2D, width: number) {
        context.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        context.fillRect(
            this.x * width,
            this.y * width,
            width,
            width,
        );
    }
}

function moveX(direction: 0 | -1 | 1, current: number, width: number) {
    let temp = current;

    if (direction === -1) {
        if (current / width <= 1) {
            temp = current + width - 1;
        } else {
            temp = current - 1;
        }
    }

    if (direction === 1) {
        if ((current + 1) % width === 0) {
            temp = current - (width - 1);
        } else {
            temp = current + 1;
        }
    }

    return temp;
}
function moveY(direction: 0 | -1 | 1, current: number, width: number, height: number) {
    let temp = current;

    if (direction === -1) {
        if (current / width < 1) {
            temp = current + (height - 1) * width;
        } else {
            temp = current - width;
        }
    }

    if (direction === 1) {
        if (current / width >= height - 1) {
            if (current / width < height) {
                temp = current - (height - 1) * width;
            }
        } else {
            temp = current + width;
        }
    }

    return temp;
}

function surroundingIndices(current: number, width: number, height: number) {
    const topLeft = moveY(-1, moveX(-1, current, width), width, height);
    const top = moveY(-1, moveX(0, current, width), width, height);
    const topRight = moveY(-1, moveX(1, current, width), width, height);
    const right = moveY(0, moveX(1, current, width), width, height);
    const bottomRight = moveY(1, moveX(1, current, width), width, height);
    const bottom = moveY(1, moveX(0, current, width), width, height);
    const bottomLeft = moveY(1, moveX(-1, current, width), width, height);
    const left = moveY(0, moveX(-1, current, width), width, height);

    return [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left];
}

export function getOtherIndex(current: number, width: number, height: number) {
    let other;
    const randX = Math.floor(Math.random() * 3);
    const randY = Math.floor(Math.random() * 3);

    let dirX: 0 | -1 | 1;
    let dirY: 0 | -1 | 1;

    if (randX === 0) {
        dirX = -1;
    } else if (randX === 1) {
        dirX = 1;
    } else {
        dirX = 0;
    }
    if (randY === 0) {
        dirY = -1;
    } else if (randY === 1) {
        dirY = 1;
    } else {
        dirY = 0;
    }

    other = moveX(dirX, current, width);
    other = moveY(dirY, other, width, height);

    return other;
}