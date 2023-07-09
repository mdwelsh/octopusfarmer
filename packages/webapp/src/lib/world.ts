import { nanoid } from 'nanoid';
import _ from 'lodash';
import { Octopus } from '@/lib/octopus.ts';

/** Initial speed for the Octopus. */
const INIT_SPEED = 5;
/** Initial number of tentacles for the Octopus. */
const INIT_TENTACLES = 4;
/** Initial length of the Octopus's tentacles. */
const INIT_REACH = 5;
/** Initial attack power for the Octopus. */
const INIT_ATTACK_POWER = 25;

/** This is the external Redis representation of the World. */
export interface WorldData {
	width: number;
	height: number;
	moves: number;
	score: number;
	octopus: OctopusData;
	fishGroups: FishGroupData[];
}

/** This is the external Redis representation of the Octopus. */
export interface OctopusData {
	x: number;
	y: number;
	speed: number;
	reach: number;
	attack: number;
	tentacles: TentacleData[];
}

/** This is the external Redis representation of a Tentacle. */
export interface TentacleData {
	fishId: string | null;
}

/** This is the external Redis representation of a FishGroup. */
export interface FishGroupData {
	fishes: FishData[];
	glyph: string;
	center_x: number;
	center_y: number;
	radius: number;
	numFishes: number;
	health: number;
	value: number;
	speed: number;
	fright: number;
	spawnRate: number;
	lastSpawn: number;
}

/** This is the external Redis representation of a Fish. */
export interface FishData {
	id: string;
	x: number;
	y: number;
	health: number;
}

/** A Fish, which the Octopus wants to eat. */
export class Fish {
	id: string;
	world: World;
	group: FishGroup;
	x: number;
	y: number;
	health: number;

	constructor(world: World, group: FishGroup, x: number, y: number, id?: string, health?: number) {
		this.id = id ?? Fish.newId();
		this.world = world;
		this.group = group;
		this.x = x;
		this.y = y;
		this.health = health ?? group.health;
		this.world.allFish.set(this.id, this);
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
		if (this.health <= 0) {
			// Remove this fish from the group.
			this.group.fishes = this.group.fishes.filter((f) => f != this);
			// Remove this fish from the world.
			this.world.allFish.delete(this.id);
			return;
		}
		if (Math.random() < 0.25) {
			let mx = Math.floor(Math.random() * this.group.speed);
			if (Math.random() < 0.5) {
				mx = -mx;
			}
			let my = Math.floor(Math.random() * this.group.speed);
			if (Math.random() < 0.5) {
				my = -my;
			}
			this.x = Math.max(0, Math.min(this.x + mx, this.world.width - 1));
			this.y = Math.max(0, Math.min(this.y + my, this.world.height - 1));
		}
		// If we are under attack, then move away from the Octopus.
		if (this.underAttack() && Math.random() < this.group.fright) {
			const octopus = this.world.octopus;
			if (this.x < octopus.x) {
				this.x = Math.max(0, this.x - this.group.speed);
			}
			if (this.x > octopus.x) {
				this.x = Math.min(this.world.width - 1, this.x + this.group.speed);
			}
			if (this.y < octopus.y) {
				this.y = Math.max(0, this.y - this.group.speed);
			}
			if (this.y > octopus.y) {
				this.y = Math.min(this.world.height - 1, this.y + this.group.speed);
			}
		}
	}

	toFishData(): FishData {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			health: this.health,
		};
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
	health: number;
	value: number;
	speed: number;
	fright: number;
	spawnRate: number;
	lastSpawn: number;

	constructor(
		world: World,
		data?: FishGroupData,
		glyph?: string,
		center_x?: number,
		center_y?: number,
		radius?: number,
		numFishes?: number,
		health?: number,
		value?: number,
		speed?: number,
		fright?: number,
		spawnRate?: number
	) {
		this.world = world;
		this.glyph = data?.glyph ?? glyph!;
		this.center_x = data?.center_x ?? center_x!;
		this.center_y = data?.center_y ?? center_y!;
		this.radius = data?.radius ?? radius!;
		this.numFishes = data?.numFishes ?? numFishes!;
		this.health = data?.health ?? health!;
		this.value = data?.value ?? value!;
		this.speed = data?.speed ?? speed!;
		this.fright = data?.fright ?? fright!;
		this.spawnRate = data?.spawnRate ?? spawnRate!;
		this.lastSpawn = data?.lastSpawn ?? 0;

		this.fishes =
			data?.fishes?.map((f) => new Fish(world, this, f.x, f.y, f.id, f.health)) ??
			_.range(this.numFishes).map(() => {
				const x = Math.max(0, Math.min(this.center_x + Math.floor(Math.random() * this.radius), world.width - 1));
				const y = Math.max(0, Math.min(this.center_y + Math.floor(Math.random() * this.radius), world.height - 1));
				return new Fish(this.world, this, x, y);
			});
	}

	/** Update all of the Fish in this FishGroup, and spawn new Fish if needed. */
	update(): void {
		for (let fish of this.fishes) {
			fish.update();
		}
		if (this.fishes.length < this.numFishes && this.world.moves - this.lastSpawn > this.spawnRate) {
			const x = Math.max(0, Math.min(this.center_x + Math.floor(Math.random() * this.radius), this.world.width - 1));
			const y = Math.max(0, Math.min(this.center_y + Math.floor(Math.random() * this.radius), this.world.height - 1));
			this.fishes.push(new Fish(this.world, this, x, y));
			this.lastSpawn = this.world.moves;
		}
	}

	toFishGroupData(): FishGroupData {
		return {
			glyph: this.glyph,
			center_x: this.center_x,
			center_y: this.center_y,
			radius: this.radius,
			numFishes: this.numFishes,
			health: this.health,
			value: this.value,
			speed: this.speed,
			fright: this.fright,
			spawnRate: this.spawnRate,
			lastSpawn: this.lastSpawn,
			fishes: this.fishes.map((fish) => fish.toFishData()),
		};
	}
}

/** Represents the game world. */
export class World {
	width: number;
	height: number;
	moves: number;
	score: number;
	fishGroups: FishGroup[];
	octopus: Octopus;
	allFish: Map<string, Fish>;

	constructor(data?: WorldData, width?: number, height?: number) {
		this.width = data?.width ?? width!;
		this.height = data?.height ?? height!;
		this.moves = data?.moves ?? 0;
		this.score = data?.score ?? 0;
		this.allFish = new Map();

		this.fishGroups = data?.fishGroups
			? data.fishGroups.map((groupData) => new FishGroup(this, groupData))
			: [
					new FishGroup(this, undefined, '*', 5, 5, 5, 5, 100, 10, 1, 0.0, 50),
					new FishGroup(
						this,
						undefined,
						'<',
						Math.floor(width! / 2) + 5,
						Math.floor(height! / 2) - 5,
						3,
						5,
						150,
						10,
						2,
						0.1,
						50
					),
					new FishGroup(this, undefined, '>', width! - 20, height! - 30, 4, 10, 175, 10, 3, 0.2, 50),
			  ];

		this.octopus = data?.octopus
			? new Octopus(this, data?.octopus)
			: new Octopus(
					this,
					undefined,
					Math.floor(width! / 2),
					Math.floor(height! / 2),
					INIT_SPEED,
					INIT_TENTACLES,
					INIT_REACH,
					INIT_ATTACK_POWER
			  );
	}

	/** Move the octopus to the given position. */
	moveOctopus(x: number, y: number): void {
		this.octopus.moveTo(x, y);
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
			width: this.width,
			height: this.height,
			moves: this.moves,
			score: this.score,
			fishGroups: this.fishGroups.map((fg) => fg.toFishGroupData()),
			octopus: this.octopus.toOctopusData(),
		};
	}

	toJSON(): string {
		return JSON.stringify(this.toWorldData());
	}
}
