export type GameData = {
	gameId: string;
	world: WorldData;
};

export type WorldData = {
	width: number;
	height: number;
	moves: number;
	score: number;
	octopus: OctopusData;
	fishGroups: FishGroupData[];
}

export type OctopusData = {
	x: number;
	y: number;
	speed: number;
	reach: number;
	attack: number;
	tentacles: TentacleData[];
};

export type TentacleData = {
	fishId: string | null;
};

export type FishGroupData = {
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
};

export type FishData = {
	id: string;
	x: number;
	y: number;
	health: number;
};

export type MoveData = {
	moves: number;
	octopus: OctopusPosition;
};

export type OctopusPosition = {
	x: number;
	y: number;
};
