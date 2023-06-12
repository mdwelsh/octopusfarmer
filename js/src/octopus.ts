import { Fish, World, WorldObject } from "./world.js";


export class Octopus implements WorldObject {
    world: World;
    glyph: string;
    x: number;
    y: number;
    speed: number;
    num_tentacles: number;
    reach: number;
    attack_power: number;
    tentacles: Fish[];

    constructor(world: World, glyph: string, x: number, y: number, speed: number, num_tentacles: number, reach: number, attack_power: number) {
        this.glyph = glyph;
        this.world = world;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.num_tentacles = num_tentacles;
        this.reach = reach;
        this.attack_power = attack_power;
        this.tentacles = [];
    }

    render(): string {
        return this.glyph;
    }

    move(): void {
        // TODO: move octopus
    }

    moveTo(x: number, y: number): void {
        if (this.distance(x, y) <= this.speed) {
            this.x = Math.max(0, Math.min(this.world.width - 1, x));
            this.y = Math.max(0, Math.min(this.world.width - 1, y));
        }
    }
    moveLeft(): void {
        this.moveTo(this.x - this.speed, this.y);
    }
    moveRight(): void {
        this.moveTo(this.x + this.speed, this.y);
    }
    moveUp(): void {
        this.moveTo(this.x, this.y - this.speed);
    }
    moveDown(): void {
        this.moveTo(this.x, this.y + this.speed);
    }

    distance(x: number, y: number): number {
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
    }

    canReach(fish: Fish): boolean {
        return this.distance(fish.x, fish.y) <= this.reach;
    }

    update(): void {
        // Move ourselves.
        this.move();

        // Check whether any fish have gone out of range.
        for (let tentacle of this.tentacles) {
            if (tentacle && !this.canReach(tentacle)) {
                // Fish goes out of range and immediately heals.
                tentacle.health = tentacle.maxHealth;
                const index = this.tentacles.indexOf(tentacle);
                if (index != -1) {
                    this.tentacles.splice(index, 1);
                }
            }
        }

        // Sort fish by distance.
        let fishByDistance = [];
        for (let fishGroup of this.world.fishGroups) {
            for (let fish of fishGroup.fishes) {
                if (this.canReach(fish)) {
                    fishByDistance.push(fish);
                }
            }
        }
        fishByDistance.sort((a, b) => this.distance(a.x, a.y) - this.distance(b.x, b.y));

        // Grab any fish that we don't already have in our tentacles.
        for (let fish of fishByDistance) {
            if (this.tentacles.length >= this.num_tentacles) {
                break;
            }
            if (this.tentacles.indexOf(fish) == -1) {
                this.tentacles.push(fish);
            }
        }

        // Attack any fish that we have in our tentacles.
        for (let tentacle of this.tentacles) {
            if (tentacle && tentacle.health > 0) {
                tentacle.health -= this.attack_power;
                if (tentacle.health <= 0) {
                    // We killed a fish.
                    this.world.score += tentacle.value;
                    // Remove this fish from the world.
                    for (let fishGroup of this.world.fishGroups) {
                        const index = fishGroup.fishes.indexOf(tentacle);
                        if (index != -1) {
                            fishGroup.fishes.splice(index, 1);
                        }
                    }
                }
            }
        }
    }
}

export class MyOctopus extends Octopus {

    constructor(world: World, glyph: string, x: number, y: number, speed: number, num_tentacles: number, reach: number, attack_power: number) {
        super(world, glyph, x, y, speed, num_tentacles, reach, attack_power);
    }

    move(): void {
        // Your job is to replace this function with one that does a much better job than a naive
        // random walk.
        const r = Math.random();
        if (r < 0.25) {
            this.moveLeft();
        } else if (r < 0.5) {
            this.moveRight();
        } else if (r < 0.75) {
            this.moveUp();
        } else {
            this.moveDown();
        }
    }
}