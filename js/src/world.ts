
const INIT_SPEED = 1;
const INIT_TENTACLES = 4;
const INIT_REACH = 5;
const INIT_ATTACK_POWER = 2;

export interface WorldObject {
    x: number;
    y: number;
    render(): string;
}

export class Fish implements WorldObject {
    world: World;
    glyph: string;
    x: number;
    y: number;
    value: number;
    health: number;
    maxHealth: number;
    direction: "left" | "right" | "up" | "down";

    constructor(world: World, glyph: string, x: number, y: number, value: number, health: number) {
        this.world = world;
        this.glyph = glyph;
        this.x = x;
        this.y = y;
        this.value = value;
        this.health = health;
        this.maxHealth = health;
        this.direction = "right";
    }

    underAttack(): boolean {
        // If this is one of the octopus's tentacles, then we're under attack.
        for (let tentacle of this.world.octopus.tentacles) {
            if (tentacle == this) {
                return true;
            }
        }
        return false;
    }

    render(): string {
        return this.glyph;
    }

    update(): void {
        let nx = this.x;
        let ny = this.y;
        if (Math.random() < 0.25) {
            nx = Math.max(0, Math.min(this.x + Math.floor(Math.random() * 3) - 1, this.world.width - 1));
            ny = Math.max(0, Math.min(this.y + Math.floor(Math.random() * 3) - 1, this.world.height - 1));
        }
        if (nx < this.x) {
            this.direction = "left";
        } else if (nx > this.x) {
            this.direction = "right";
        } else if (ny < this.y) {
            this.direction = "up";
        } else if (ny > this.y) {
            this.direction = "down";
        }
        this.x = nx;
        this.y = ny;
    }
}

export class FishGroup {
    fishes: Fish[];
    world: World;
    glyph: string;
    center_x: number;
    center_y: number;
    radius: number;
    numFishes: number;
    value: number;
    spawnRate: number;
    lastSpawn: number;

    constructor(world: World, glyph: string, center_x: number, center_y: number, radius: number, numFishes: number, value: number, spawnRate: number) {
        this.world = world;
        this.glyph = glyph;
        this.center_x = center_x;
        this.center_y = center_y;
        this.radius = radius;
        this.numFishes = numFishes;
        this.value = value;
        this.fishes = [];
        this.spawnRate = spawnRate;
        this.lastSpawn = 0;
        for (let i = 0; i < numFishes; i++) {
            const x = Math.max(0, Math.min(center_x + Math.floor(Math.random() * radius), world.width - 1));
            const y = Math.max(0, Math.min(center_y + Math.floor(Math.random() * radius), world.height - 1));
            this.fishes.push(new Fish(this.world, this.glyph, x, y, value, 100));
        }
    }

    update(): void {
        for (let fish of this.fishes) {
            fish.update();
        }
        if (this.fishes.length < this.numFishes && this.world.moves - this.lastSpawn > this.spawnRate) {
            const x = Math.max(0, Math.min(this.center_x + Math.floor(Math.random() * this.radius), this.world.width - 1));
            const y = Math.max(0, Math.min(this.center_y + Math.floor(Math.random() * this.radius), this.world.height - 1));
            this.fishes.push(new Fish(this.world, this.glyph, x, y, this.value, 100));
            this.lastSpawn = this.world.moves;
        }
    }
}

export class OctopusReach implements WorldObject {
    x: number;
    y: number;
    distance: number;

    constructor(x: number, y: number, distance: number) {
        this.x = x;
        this.y = y;
        this.distance = distance;
    }

    render() {
        return " ";
    }
}

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

    moveLeft(): void {
        this.x = Math.max(0, this.x - this.speed);
    }
    moveRight(): void {
        this.x = Math.min(this.world.width - 1, this.x + this.speed);
    }
    moveUp(): void {
        this.y = Math.max(0, this.y - this.speed);
    }
    moveDown(): void {
        this.y = Math.min(this.world.height - 1, this.y + this.speed);
    }

    distance(x: number, y: number): number {
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
    }

    canReach(fish: Fish): boolean {
        return this.distance(fish.x, fish.y) <= this.reach;
    }

    reachCells(): OctopusReach[] {
        let cells = [];
        for (let x = this.x - this.reach; x <= this.x + this.reach; x++) {
            for (let y = this.y - this.reach; y <= this.y + this.reach; y++) {
                if (this.distance(x, y) <= this.reach && x >= 0 && x < this.world.width && y >= 0 && y < this.world.height) {
                    cells.push(new OctopusReach(x, y, this.distance(x, y)));
                }
            }
        }
        return cells;
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

export class World {
    width: number;
    height: number;
    fishGroups: FishGroup[];
    octopus: Octopus;
    moves: number;
    score: number;

    constructor(width: number, height: number) {
        this.moves = 0;
        this.score = 0;
        this.width = width;
        this.height = height;
        this.octopus = new Octopus(this, "0", Math.floor(width / 2), Math.floor(height / 2), INIT_SPEED, INIT_TENTACLES, INIT_REACH, INIT_ATTACK_POWER);
        this.fishGroups = [];
        this.fishGroups.push(new FishGroup(this, "f", 5, 5, 5, 5, 10, 50));
        this.fishGroups.push(new FishGroup(this, "f", Math.floor(width / 2), Math.floor(height / 2), 3, 5, 10, 50));
        this.fishGroups.push(new FishGroup(this, "f", width - 20, height - 30, 4, 10, 10, 50));
    }

    update(): void {
        this.moves++;
        for (let fishGroup of this.fishGroups) {
            fishGroup.update();
        }
        this.octopus.update();
    }

    fishes(): Fish[] {
        let fishes: Fish[] = [];
        for (let fishGroup of this.fishGroups) {
            fishes = fishes.concat(fishGroup.fishes);
        }
        return fishes;
    }

    objects(): WorldObject[] {
        let objects: WorldObject[] = [];
        objects = objects.concat(this.fishes());
        objects = objects.concat(this.octopus);
        objects = objects.concat(this.octopus.reachCells());
        return objects;
    }

}
