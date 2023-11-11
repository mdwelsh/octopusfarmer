import { nanoid } from 'nanoid';
import seedrandom, { StatefulPRNG, State } from 'seedrandom';

import { GameType, NewGameRequest, WorldData, TentacleData, OctopusData, FishData } from '@mdwelsh/octofarm';

/** Internal representation of a group of fish. */
export type FishGroupData = {
	center_x: number;
	center_y: number;
	radius: number;
	numFishes: number;
	health: number;
	value: number;
	speed: number;
	fright: number;
	spawnRate: number;
	fishes?: FishData[];
	lastSpawn?: number;
};

/** Internal representation of the world state for a given game. */
export type WorldDataInternal = {
	width: number;
	height: number;
	moves: number;
	score: number;
	octopus: OctopusData;
	fishGroups: FishGroupData[];
	prngState?: object;
};

/** Internal representation of a single game state. */
export type GameDataInternal = {
	gameId: string;
	gameType: GameType;
	owner?: string;
	seed?: number;
	created: string;
	modified: string;
	world: WorldDataInternal;
};

/** A Fish, which the Octopus wants to eat. */
export class Fish {
	world: World;
	group: FishGroup;
	data: FishData;

	constructor(world: World, group: FishGroup, data: FishData) {
		this.world = world;
		this.group = group;
		this.data = data;
		this.world.allFish.set(this.data.id, this);
	}

	static newId(): string {
		return nanoid();
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

	/** Update the Fish's status. */
	update(): void {
		if (this.data.health <= 0) {
			// Remove this fish from the group.
			this.group.fishes = this.group.fishes.filter((f) => f != this);
			// Remove this fish from the world.
			this.world.allFish.delete(this.data.id);
			return;
		}
		if (this.world.prng() < 0.25) {
			let mx = Math.floor(this.world.prng() * this.group.data.speed);
			if (this.world.prng() < 0.5) {
				mx = -mx;
			}
			let my = Math.floor(this.world.prng() * this.group.data.speed);
			if (this.world.prng() < 0.5) {
				my = -my;
			}
			this.data.x = Math.max(0, Math.min(this.data.x + mx, this.world.data.width - 1));
			this.data.y = Math.max(0, Math.min(this.data.y + my, this.world.data.height - 1));
		}
		// If we are under attack, then move away from the Octopus.
		if (this.underAttack() && this.world.prng() < this.group.data.fright) {
			const octopus = this.world.octopus;
			if (this.data.x < octopus.x) {
				this.data.x = Math.max(0, this.data.x - this.group.data.speed);
			}
			if (this.data.x > octopus.x) {
				this.data.x = Math.min(this.world.data.width - 1, this.data.x + this.group.data.speed);
			}
			if (this.data.y < octopus.y) {
				this.data.y = Math.max(0, this.data.y - this.group.data.speed);
			}
			if (this.data.y > octopus.y) {
				this.data.y = Math.min(this.world.data.height - 1, this.data.y + this.group.data.speed);
			}
		}
	}

	toFishData(): FishData {
		return this.data;
	}
}

/** Represents a group of Fish with the same basic properties, clustered around a center point. */
export class FishGroup {
	world: World;
	data: FishGroupData;
	fishes: Fish[];

	constructor(world: World, data: FishGroupData) {
		this.world = world;
		this.data = data;
		this.data.lastSpawn = this.data.lastSpawn ?? 0;
		this.fishes =
			data?.fishes?.map((f) => new Fish(world, this, f)) ??
			Array.from(Array(this.data.numFishes).keys()).map(() => {
				const x = Math.max(
					0,
					Math.min(this.data.center_x + Math.floor(this.world.prng() * this.data.radius), world.data.width - 1)
				);
				const y = Math.max(
					0,
					Math.min(this.data.center_y + Math.floor(this.world.prng() * this.data.radius), world.data.height - 1)
				);
				return new Fish(this.world, this, { x, y, id: Fish.newId(), value: this.data.value, health: this.data.health });
			});
	}

	/** Update all of the Fish in this FishGroup, and spawn new Fish if needed. */
	update(): void {
		for (let fish of this.fishes) {
			fish.update();
		}
		if (
			this.fishes.length < this.data.numFishes &&
			this.world.data.moves - (this.data.lastSpawn ?? 0) > this.data.spawnRate
		) {
			// Spawn a new fish.
			const x = Math.max(
				0,
				Math.min(this.data.center_x + Math.floor(this.world.prng() * this.data.radius), this.world.data.width - 1)
			);
			const y = Math.max(
				0,
				Math.min(this.data.center_y + Math.floor(this.world.prng() * this.data.radius), this.world.data.height - 1)
			);
			this.fishes.push(
				new Fish(this.world, this, { x, y, id: Fish.newId(), value: this.data.value, health: this.data.health })
			);
			this.data.lastSpawn = this.world.data.moves;
		}
	}

	toFishGroupData(): FishGroupData {
		return {
			...this.data,
			fishes: this.fishes.map((fish) => fish.toFishData()),
		};
	}
}

/**
 * Represents the Octopus, which the player's code will control.
 */
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
			this.tentacles = data.tentacles.map((tentacleData?: TentacleData) =>
				tentacleData && tentacleData.fishId ? world.fishById(tentacleData.fishId) : null
			);
		} else {
			this.x = x!;
			this.y = y!;
			this.speed = speed!;
			this.tentacles = Array(num_tentacles!).fill(null);
			this.reach = reach!;
			this.attack = attack!;
		}
	}

	toOctopusData(): OctopusData {
		return {
			x: this.x,
			y: this.y,
			speed: this.speed,
			reach: this.reach,
			attack: this.attack,
			tentacles: this.tentacles.map((tentacle: Fish | null) => {
				return { fishId: tentacle ? tentacle.data.id : null };
			}),
		};
	}

	/**
	 * Move to the given coordinates, as long as they are within this.speed units away.
	 * Raises an error otherwise.
	 */
	moveTo(x: number, y: number): void {
		if (this.distance(x, y) <= this.speed) {
			this.x = Math.max(0, Math.min(this.world.data.width - 1, x));
			this.y = Math.max(0, Math.min(this.world.data.width - 1, y));
		} else {
			throw new Error(`Cannot move to coordinates that are more than ${this.speed} units away`);
		}
	}

	/** Return the distance between the octopus and the given coordinates. */
	distance(x: number, y: number): number {
		return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
	}

	/** Return true if the given fish is within this.reach units of this octopus. */
	canReach(fish: Fish): boolean {
		return this.distance(fish.data.x, fish.data.y) <= this.reach;
	}

	/** Update the state of this octopus on each game step. */
	update(): void {
		// Check whether any fish have gone out of range.
		for (let tentacle of this.tentacles) {
			if (tentacle && !this.canReach(tentacle)) {
				// Fish goes out of range and immediately heals.
				tentacle.data.health = tentacle.group.data.health;
				const index = this.tentacles.indexOf(tentacle);
				if (index != -1) {
					this.tentacles[index] = null;
				}
			}
		}

		// Sort fish by distance.
		let fishByDistance: Fish[] = [];
		for (let fishGroup of this.world.fishGroups) {
			for (let fish of fishGroup.fishes) {
				if (this.canReach(fish)) {
					fishByDistance.push(fish);
				}
			}
		}
		fishByDistance.sort((a, b) => this.distance(a.data.x, a.data.y) - this.distance(b.data.x, b.data.y));

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
			if (tentacle && tentacle.data.health > 0) {
				tentacle.data.health -= this.attack;
				if (tentacle.data.health <= 0) {
					// We killed a fish. It will be removed from the world on the next update.
					this.world.data.score += tentacle.group.data.value;
					// Remove this fish from our tentacles.
					const index = this.tentacles.indexOf(tentacle);
					if (index != -1) {
						this.tentacles[index] = null;
					}
				}
			}
		}
	}
}

/** Represents the game world. */
export class World {
	data: WorldDataInternal;
	fishGroups: FishGroup[];
	octopus: Octopus;
	allFish: Map<string, Fish>;
	prng: StatefulPRNG<State.Arc4>;

	/**
	 * Initialize a game world instance.
	 *
	 * This is initialized either from a WorldDataInternal object, or from a NewGameRequest.
	 */
	constructor({ newGame, loadGame }: { newGame?: NewGameRequest; loadGame?: WorldDataInternal }) {
		if (newGame === undefined && loadGame === undefined) {
			throw new Error('Must provide either newGame or loadGame');
		}
		if (newGame !== undefined && loadGame !== undefined) {
			throw new Error('Cannot provide both newGame and loadGame');
		}
		this.allFish = new Map();
		let worldData: WorldDataInternal;

		if (newGame !== undefined) {
			// Create a new game.
			this.prng = seedrandom(newGame.seed ? newGame.seed.toString() : undefined, { state: true });
			newGame.gameType = newGame.gameType ?? 'normal';
			console.log(`Creating new game - gameType ${newGame.gameType}, seed ${newGame.seed}`);
			switch (newGame.gameType) {
				case 'test':
					// The test game is a 100x100 world with a single fish group
					// in the upper left corner.
					worldData = {
						width: 100,
						height: 100,
						moves: 0,
						score: 0,
						octopus: {
							x: 50,
							y: 50,
							speed: 4,
							tentacles: new Array(4),
							reach: 5,
							attack: 25,
						},
						fishGroups: [
							{
								center_x: 25,
								center_y: 25,
								radius: 10,
								numFishes: 5,
								health: 10,
								value: 1,
								speed: 2,
								fright: 0,
								spawnRate: 10,
							},
						],
					};
					break;
				case 'normal':
					// Normal game is 500x500, with three fish groups.
					// TODO: Implement hard and insane games as separate
					// configurations.
					worldData = {
						width: 500,
						height: 500,
						moves: 0,
						score: 0,
						octopus: {
							x: 250,
							y: 250,
							speed: 4,
							tentacles: new Array(8),
							reach: 5,
							attack: 25,
						},
						fishGroups: [
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 15,
								numFishes: 20,
								health: 25,
								value: 10,
								speed: 4,
								fright: 0.1,
								spawnRate: 2,
							},
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 20,
								numFishes: 10,
								health: 100,
								value: 20,
								speed: 12,
								fright: 0.2,
								spawnRate: 5,
							},
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 30,
								numFishes: 5,
								health: 200,
								value: 100,
								speed: 18,
								fright: 0.4,
								spawnRate: 10,
							},
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 15,
								numFishes: 20,
								health: 25,
								value: 10,
								speed: 4,
								fright: 0.1,
								spawnRate: 2,
							},
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 15,
								numFishes: 20,
								health: 25,
								value: 10,
								speed: 4,
								fright: 0.1,
								spawnRate: 2,
							},
						],
					};
					break;
				case 'hard':
					// Hard game is 500x500, with one fish group.
					worldData = {
						width: 500,
						height: 500,
						moves: 0,
						score: 0,
						octopus: {
							x: 250,
							y: 250,
							speed: 4,
							tentacles: new Array(8),
							reach: 5,
							attack: 25,
						},
						fishGroups: [
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 100,
								numFishes: 50,
								health: 100,
								value: 100,
								speed: 10,
								fright: 0.25,
								spawnRate: 4,
							},
						],
					};
					break;
				case 'insane':
					// Insane game is 500x500, with one fish!
					worldData = {
						width: 500,
						height: 500,
						moves: 0,
						score: 0,
						octopus: {
							x: 250,
							y: 250,
							speed: 10,
							tentacles: new Array(8),
							reach: 10,
							attack: 25,
						},
						fishGroups: [
							{
								center_x: this.prng() * 500,
								center_y: this.prng() * 500,
								radius: 25,
								numFishes: 1,
								health: 10000,
								value: 1000,
								speed: 30,
								fright: 0.5,
								spawnRate: 1,
							},
						],
					};
					break;
				default:
					throw new Error(`Unknown game type ${newGame.gameType}`);
			}
		} else {
			// Load game from provided state.
			worldData = loadGame!;
			this.prng = seedrandom('', { state: loadGame!.prngState as State.Arc4 });
		}
		this.data = worldData;
		this.fishGroups = worldData!.fishGroups.map((groupData) => new FishGroup(this, groupData));
		this.octopus = new Octopus(this, worldData!.octopus);
	}

	/** Move the octopus to the given position. */
	moveOctopus(x: number, y: number): void {
		this.octopus.moveTo(x, y);
	}

	/** Update the state of the world. */
	update(): void {
		this.data.moves++;
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

	/** Return the fish with the given ID. */
	fishById(id: string): Fish {
		const fish = this.allFish.get(id);
		if (!fish) {
			throw new Error(`No fish with ID ${id}`);
		}
		return fish;
	}

	toWorldData(): WorldData {
		return {
			width: this.data.width,
			height: this.data.height,
			moves: this.data.moves,
			score: this.data.score,
			fish: this.fishes().map((fish) => fish.toFishData()),
			octopus: this.octopus.toOctopusData(),
		};
	}

	toWorldDataInternal(): WorldDataInternal {
		return {
			...this.data,
			fishGroups: this.fishGroups.map((fg) => fg.toFishGroupData()),
			octopus: this.octopus.toOctopusData(),
			prngState: this.prng.state(),
		};
	}

	toJSON(): string {
		return JSON.stringify(this.toWorldData());
	}
}
