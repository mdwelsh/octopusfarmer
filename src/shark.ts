import { Predator } from "./predator.js";
import { Fish, World } from "./world.js";

enum Direction {
    Up, Down, Left, Right
}

/**
 * Sharks are another kind of predator. They have no tentacles and can't
 * sit still, but they're fast and powerful.
 */
export class Shark implements Predator {
    world: World;
    x: number;
    y: number;
    speed: number;
    direction: Direction;

    constructor(world: World, x: number, y: number) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.direction = Direction.Left;
    }

    render(): string {
        switch (this.direction) {
            case Direction.Up:
                return "^";
            case Direction.Down:
                return "v";
            case Direction.Left:
                return "<";
            case Direction.Right:
                return ">";
        }
    }

    move(): void {
        switch (this.direction) {
            case Direction.Up:
                this.y = Math.max(0, Math.min(this.world.height - 1, this.y - this.speed));
                break;
            case Direction.Down:
                this.y = Math.max(0, Math.min(this.world.height - 1, this.y + this.speed));
                break;
            case Direction.Left:
                this.x = Math.max(0, Math.min(this.world.width - 1, this.x - this.speed));
                break;
            case Direction.Right:
                this.x = Math.max(0, Math.min(this.world.width - 1, this.x + this.speed));
                break;
        }
    }

    moveLeft(): void {
        this.direction = Direction.Left;
    }

    moveRight(): void {
        this.direction = Direction.Right;
    }

    moveUp(): void {
        this.direction = Direction.Up;
    }

    moveDown(): void {
        this.direction = Direction.Down;
    }


    /** Return whether this shark is currently attacking the given fish. */
    isAttacking(fish: Fish): boolean {
        switch (this.direction) {
            case Direction.Up:
                return this.x == fish.x && this.y > fish.y && this.y - fish.y <= this.speed;
            case Direction.Down:
                return this.x == fish.x && this.y < fish.y && fish.y - this.y <= this.speed;
            case Direction.Left:
                return this.y == fish.y && this.x > fish.x && this.x - fish.x <= this.speed;
            case Direction.Right:
                return this.y == fish.y && this.x < fish.x && fish.x - this.x <= this.speed;
        }
    }

    /** Update the state of this octopus on each game step. */
    update(): void {

        // Attack any fish we're about to move through.
        for (let fishGroup of this.world.fishGroups) {
            for (let i = 0; i < fishGroup.fishes.length; i++) {
                let fish = fishGroup.fishes[i];
                if (this.isAttacking(fish)) {
                    this.world.score += fish.value;
                    fishGroup.fishes.splice(i, 1);
                }
            }
        }

        // Move ourselves.
        this.move();
    }
}
