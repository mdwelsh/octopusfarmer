import { Fish, World, OctopusData } from "@/lib/world.js";

export class Octopus {
	world: World;
	x: number;
	y: number;
	speed: number;
	reach: number;
	attack: number;
	tentacles: (Fish | null)[];

	constructor(
		world: World,
		data?: OctopusData,
		x?: number,
		y?: number,
		speed?: number,
		num_tentacles?: number,
		reach?: number,
		attack?: number
	) {
		this.world = world;
		if (data !== undefined) {
			this.x = data.x;
			this.y = data.y;
			this.speed = data.speed;
			this.reach = data.reach;
			this.attack = data.attack;
			this.tentacles = data.tentacles.map((tentacleData) =>
				tentacleData.fishId ? world.fishById(tentacleData.fishId) : null
			);
		} else {
			this.x = x!;
			this.y = y!;
			this.speed = speed!;
			this.tentacles = Array(num_tentacles!).fill(null);
			this.reach = reach!;
			this.attack = attack!;
			this.tentacles = [];
		}
	}

	/**
	 * Move to the given coordinates, as long as they are within this.speed units away.
	 * Will not move if the given coordinates are more than this.speed units away.
	 */
	moveTo(x: number, y: number): void {
		if (this.distance(x, y) <= this.speed) {
			this.x = Math.max(0, Math.min(this.world.width - 1, x));
			this.y = Math.max(0, Math.min(this.world.width - 1, y));
		}
	}

	/** Move this.speed units to the left. */
	moveLeft(): void {
		this.moveTo(this.x - this.speed, this.y);
	}

	/** Move this.speed units to the right. */
	moveRight(): void {
		this.moveTo(this.x + this.speed, this.y);
	}

	/** Move this.speed units up. */
	moveUp(): void {
		this.moveTo(this.x, this.y - this.speed);
	}

	/** Move this.speed units down. */
	moveDown(): void {
		this.moveTo(this.x, this.y + this.speed);
	}

	/** Return the distance between the octopus and the given coordinates. */
	distance(x: number, y: number): number {
		return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
	}

	/** Return true if the given fish is within this.reach units of this octopus. */
	canReach(fish: Fish): boolean {
		return this.distance(fish.x, fish.y) <= this.reach;
	}

	/** Update the state of this octopus on each game step. */
	update(): void {
		// Check whether any fish have gone out of range.
		for (let tentacle of this.tentacles) {
			if (tentacle && !this.canReach(tentacle)) {
				// Fish goes out of range and immediately heals.
				tentacle.health = tentacle.group.health;
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
		fishByDistance.sort(
			(a, b) => this.distance(a.x, a.y) - this.distance(b.x, b.y)
		);

		// Grab any fish that we don't already have in our tentacles.
		for (let fish of fishByDistance) {
			// If none of the entries of tentacles are null, can't grab any more.
			if (this.tentacles.every((tentacle) => tentacle !== null)) {
				break;
			}
			// Can't grab a fish twice.
			if (this.tentacles.indexOf(fish) != -1) {
				continue;
			}
			// Grab fish with the first empty tentacle.
			this.tentacles[this.tentacles.indexOf(null)] = fish;
		}

		// Attack any fish that we have in our tentacles.
		for (let tentacle of this.tentacles) {
			if (tentacle && tentacle.health > 0) {
				tentacle.health -= this.attack;
				if (tentacle.health <= 0) {
					// We killed a fish. It will be removed from the world on the next update.
					this.world.score += tentacle.group.value;
				}
			}
		}
	}
}
