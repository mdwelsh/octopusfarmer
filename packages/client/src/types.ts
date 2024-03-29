/**
 * This file contains type definitions for the Octopus Farmer game state.
 */

export type GameType = 'test' | 'easy' | 'normal' | 'hard' | 'insane';

/** A request to create a new game. */
export type NewGameRequest = {
	/** The email address of the game owner. This will be hidden from other players. */
	owner: string;

	/**
	 * The game type to create. If unspecified, defaults to "normal".
	 * 	 "test": A test game with one fish group and one trap.
	 *   "easy": A game without any traps.
	 * 	 "normal": A normal difficulty game.
	 * 	 "hard": A hard difficulty game.
	 * 	 "insane": An insanely difficult game.
	 */
	gameType?: GameType;

	/**
	 * The game world seed to use. If unspecified, a random seed will be provided.
	 * You can set this for testing, which will ensure the starting state of the world
	 * is consistent.
	 */
	seed?: number;
};

/** Represents a game. */
export type GameData = {
	/** The unique game ID. */
	gameId: string;
	/** Email address of the game creator. */
	owner: string;
	/** The date and time this game was created. */
	created: string;
	/** The date and time this game was last modified. */
	modified: string;
	/** The current world state for this game. */
	world: WorldData;
};

/** Represents the leaderboard metadata about the set of games. */
export type GameMetadata = {
	/** The hash of the game ID. */
	hash: string;
	/** The date and time this game was created. */
	created: string;
	/** The date and time this game was last modified. */
	modified: string;
	/** The current number of moves in this game world. */
	moves: number;
	/** The current score for this game. */
	score: number;
	/** The type of game. */
	gameType: GameType;
};

/** Represents the world state for a given game. */
export type WorldData = {
	/** The width of the world in cells. */
	width: number;
	/** The height of the world in cells. */
	height: number;
	/** The current number of moves made in this game. */
	moves: number;
	/** The current player score. */
	score: number;
	/** The state of the octopus. */
	octopus: OctopusData;
	/** The fish that the octopus is trying to capture. */
	fish: FishData[];
	/** The traps that the octopus should avoid. */
	traps: TrapData[];
};

/** Represents the state of the octopus. */
export type OctopusData = {
	/** The current x position of the octopus. */
	x: number;
	/** The current y position of the octopus. */
	y: number;
	/** The maximum number of units that the octopus can move in a single turn. */
	speed: number;
	/** The maximum number of units that each of the octopus' tentacles can reach. */
	reach: number;
	/** The amount of damage done by each tentacle in a single turn. */
	attack: number;
	/** The state of each tentacle. */
	tentacles: TentacleData[];
	/** Whether the Octopus is alive. */
	alive: boolean;
};

/** Represents a single tentacle of the octopus. */
export type TentacleData = {
	/**
	 * A tentacle can either be grabbing a fish, in which case the fish's ID is stored here,
	 * or it can be grabbing nothing, in which case this value is null.
	 */
	fishId: string | null;
};

/** Represents a single fish. */
export type FishData = {
	/** The unique ID of the fish. */
	id: string;
	/** The current x position of the fish. */
	x: number;
	/** The current y position of the fish. */
	y: number;
	/** The point value of this fish. */
	value: number;
	/** The current health of the fish. */
	health: number;
};

/** Represents a trap. If the octopus comes within `radius` units of the trap, it will die. */
export type TrapData = {
	/** The x position of the trap. */
	x: number;
	/** The y position of the trap. */
	y: number;
	/** The reach of the trap. */
	radius: number;
};

/** Represents a move that the octopus can make. */
export type MoveData = {
	/**
	 * The number of moves made in this game so far. Must match the world's `moves` parameter
	 * for the proposed move to be considered valid.
	 */
	moves: number;
	/** The proposed position of the octopus. */
	octopus: OctopusPosition;
};

/** Represents a proposed position for the octopus to move. */
export type OctopusPosition = {
	/** The proposed x position of the octopus. */
	x: number;
	/** The proposed y position of the octopus. */
	y: number;
};
