import { MyOctopus } from "./octopus.js";
import { Fish, World, WorldObject } from "./world.js";

export interface Predator extends WorldObject {
    isAttacking(fish: Fish): boolean;
    update(): void;

    moveLeft(): void;
    moveRight(): void;
    moveUp(): void;
    moveDown(): void;
}

export class PredatorFactory {
    static create(world: World, x: number, y: number): Predator {
        return new MyOctopus(world, "0", x, y);
    }
}
