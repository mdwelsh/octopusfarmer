/**
 * This module implements the world for the Octopus Farmer game.
 * YOU SHOULD NOT MODIFY ANYTHING IN THIS FILE!
 */

import { Octopus, MyOctopus } from "./octopus.js";

/** Initial speed for the Octopus. */
const INIT_SPEED = 1;
/** Initial number of tentacles for the Octopus. */
const INIT_TENTACLES = 4;
/** Initial length of the Octopus's tentacles. */
const INIT_REACH = 5;
/** Initial attack power for the Octopus. */
const INIT_ATTACK_POWER = 2;

/** Represents an object in the World that might be rendered by the UI. */
export interface WorldObject {
    x: number;
    y: number;
    render(): string;
}

/** A Fish, which the Octopus wants to eat. */
export class Fish implements WorldObject {
    world: World;
    glyph: string;
    x: number;
    y: number;
    value: number;
    health: number;
    maxHealth: number;
    speed: number;
    fright: number;

    constructor(world: World, glyph: string, x: number, y: number, value: number, speed: number, fright: number, health: number) {
        this.world = world;
        this.glyph = glyph;
        this.x = x;
        this.y = y;
        this.value = value;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.fright = fright;
    }

    /** Returns true if this Fish is currently held by the Octopus's tentacles. */
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

    /** Update the Fish's position. */
    update(): void {
        if (Math.random() < 0.25) {
            // Move no more than this.speed units.
            let mx = Math.floor(Math.random() * this.speed);
            if (Math.random() < 0.5) {
                mx = -mx;
            }
            let my = Math.floor(Math.random() * this.speed);
            if (Math.random() < 0.5) {
                my = -my;
            }
            this.x = Math.max(0, Math.min(this.x + mx, this.world.width - 1));
            this.y = Math.max(0, Math.min(this.y + my, this.world.height - 1));
        }
        // If we are under attack, then move away from the Octopus.
        if (this.underAttack() && Math.random() < this.fright) {
            const octopus = this.world.octopus;
            if (this.x < octopus.x) {
                this.x = Math.max(0, this.x - this.speed);
            }
            if (this.x > octopus.x) {
                this.x = Math.min(this.world.width - 1, this.x + this.speed);
            }
            if (this.y < octopus.y) {
                this.y = Math.max(0, this.y - this.speed);
            }
            if (this.y > octopus.y) {
                this.y = Math.min(this.world.height - 1, this.y + this.speed);
            }
        }
    }
}

/** Represents a group of Fish with the same basic properties, clustered around a center point. */
export class FishGroup {
    fishes: Fish[];
    world: World;
    glyph: string;
    center_x: number;
    center_y: number;
    radius: number;
    numFishes: number;
    value: number;
    speed: number;
    fright: number;
    spawnRate: number;
    lastSpawn: number;

    constructor(world: World, glyph: string, center_x: number, center_y: number, radius: number, numFishes: number, value: number, speed: number, fright: number, spawnRate: number) {
        this.world = world;
        this.glyph = glyph;
        this.center_x = center_x;
        this.center_y = center_y;
        this.radius = radius;
        this.numFishes = numFishes;
        this.value = value;
        this.speed = speed;
        this.fright = fright;
        this.fishes = [];
        this.spawnRate = spawnRate;
        this.lastSpawn = 0;
        for (let i = 0; i < numFishes; i++) {
            const x = Math.max(0, Math.min(center_x + Math.floor(Math.random() * radius), world.width - 1));
            const y = Math.max(0, Math.min(center_y + Math.floor(Math.random() * radius), world.height - 1));
            this.fishes.push(new Fish(this.world, this.glyph, x, y, value, speed, fright, 100));
        }
    }

    /** Update all of the Fish in this FishGroup, and spawn new Fish if needed. */
    update(): void {
        for (let fish of this.fishes) {
            fish.update();
        }
        if (this.fishes.length < this.numFishes && this.world.moves - this.lastSpawn > this.spawnRate) {
            const x = Math.max(0, Math.min(this.center_x + Math.floor(Math.random() * this.radius), this.world.width - 1));
            const y = Math.max(0, Math.min(this.center_y + Math.floor(Math.random() * this.radius), this.world.height - 1));
            this.fishes.push(new Fish(this.world, this.glyph, x, y, this.value, this.speed, this.fright, 100));
            this.lastSpawn = this.world.moves;
        }
    }
}

/** Represents the game world. */
export class World {
    width: number;
    height: number;
    fishGroups: FishGroup[];
    octopus: Octopus;

    /** The current number of moves that the world has been running. */
    moves: number;
    /** The total score of the Octopus, which is the value of all Fish that have been consumed. */
    score: number;

    constructor(width: number, height: number) {
        this.moves = 0;
        this.score = 0;
        this.width = width;
        this.height = height;
        this.octopus = new MyOctopus(this, "0", Math.floor(width / 2), Math.floor(height / 2), INIT_SPEED, INIT_TENTACLES, INIT_REACH, INIT_ATTACK_POWER);
        this.fishGroups = [];
        this.fishGroups.push(new FishGroup(this, "*", 5, 5, 5, 5, 10, 1, 0.0, 50));
        this.fishGroups.push(new FishGroup(this, "<", Math.floor(width / 2) + 5, Math.floor(height / 2) - 5, 3, 5, 10, 2, 0.1, 50));
        this.fishGroups.push(new FishGroup(this, ">", width - 20, height - 30, 4, 10, 10, 3, 0.2, 50));
    }

    /** Update the state of the world. */
    update(): void {
        this.moves++;
        for (let fishGroup of this.fishGroups) {
            fishGroup.update();
        }
        this.octopus.update();
    }

    /** Returns all Fish in the world. */
    fishes(): Fish[] {
        let fishes: Fish[] = [];
        for (let fishGroup of this.fishGroups) {
            fishes = fishes.concat(fishGroup.fishes);
        }
        return fishes;
    }

    /** Return all renderable objects in the world. Only needed by the UI. */
    objects(): WorldObject[] {
        let objects: WorldObject[] = [];
        objects = objects.concat(this.fishes());
        objects = objects.concat(this.octopus);
        return objects;
    }
}
