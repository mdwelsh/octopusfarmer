/**
 * This file has a simple TypeScript client for the Octopus Farmer game.
 * You are welcome to use it as the basis for your own submission, but there
 * is no requirement to do so.
 */

import { GameData, MoveData, OctopusPosition, WorldData, NewGameRequest } from 'octofarm-types';

import terminal from 'terminal-kit';
const { terminal: term } = terminal;

/** Callback function type used by Client.run() to move the octopus. */
type OctopusFunction = (_game: GameData) => OctopusPosition;

/**
 * A simple client to the Octopus Farmer game.
 */
export class Client {
	url!: string;
	gameId!: string;
	game!: GameData;

	/** Use Create() instead. */
	constructor() {}

	/**
	 * Create a new Octopus Farmer client.
	 * @param url The URL of the Octopus Farmer server.
	 * @param gameId The ID of the game to connect to, or null to create a new game.
	 * @returns A new Octopus Farmer client.
	 */
	public static async Create(
		url: string,
		gameId?: string | null,
		newGameRequest?: NewGameRequest | undefined
	): Promise<Client> {
		const client = new Client();
		client.url = url;
		if (gameId) {
			client.gameId = gameId;
			client.game = await client.fetchGame();
		} else {
			client.game = await client.newGame(newGameRequest);
			client.gameId = client.game.gameId;
		}
		console.log(`Created client for game ${client.gameId}`);
		return client;
	}

	/** Returns the current game score. */
	score(): number {
		return this.game.world.score;
	}

	/** Returns the current number of moves in this game. */
	moves(): number {
		return this.game.world.moves;
	}

	/** Returns the current world state. */
	world(): WorldData {
		return this.game.world;
	}

	/** Returns the URL of the game visualizer for this game. */
	previewUrl(): string {
		return `${this.url}/game/${this.gameId}`;
	}

	// Create a new game.
	async newGame(newGameRequest?: NewGameRequest): Promise<GameData> {
		console.log('MAKING NEW GAME!!!');
		try {
			const res = await fetch(`${this.url}/api/games`, {
				method: 'POST',
				body: JSON.stringify(newGameRequest ?? {}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (!res.ok) {
				throw new Error(`Unable to create game: ${JSON.stringify(res)}`);
			}
			return (await res.json()) as GameData;
		} catch (e) {
			console.log('ERROR MAKING NEW GAME!!!');
			console.log(e);
			throw e;
		}
	}

	// Read the state of the current game.
	async fetchGame(): Promise<GameData> {
		const res = await fetch(`${this.url}/api/game/${this.gameId}`, {
			method: 'GET',
		});
		if (!res.ok) {
			throw new Error(`Unable to fetch game: ${res}`);
		}
		return res.json() as Promise<GameData>;
	}

	// Move the octopus to the given position.
	async moveTo(x: number, y: number): Promise<GameData> {
		const move: MoveData = {
			moves: this.game.world.moves,
			octopus: { x, y },
		};
		const res = await fetch(`${this.url}/api/game/${this.gameId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(move),
		});
		if (!res.ok) {
			const errmsg = await res.text();
			throw new Error(`Unable to move: ${errmsg}`);
		}
		const newGame = (await res.json()) as GameData;
		this.game = newGame;
		return newGame;
	}

	/**
	 * Run a single step of thge game.
	 * @param octopus The function to call to move the octopus.
	 * @returns The updated game state.
	 */
	async step(octopus: OctopusFunction): Promise<GameData> {
		const newPosition = octopus(this.game);
		return await this.moveTo(newPosition.x, newPosition.y);
	}

	/**
	 * Run the game for the given number of steps.
	 * @param octopus The function to call to move the octopus.
	 * @param steps The number of steps to run.
	 * @returns The final game state.
	 */
	async run(octopus: OctopusFunction, steps: number): Promise<GameData> {
		term('Starting game ').blue(this.gameId)(' - live display: ').green(`${this.previewUrl()}\n`);
		const progressBar = term.progressBar({
			width: 120,
			title: `Running for ${steps} steps:`,
			titleSize: 40,
			eta: true,
			percent: true,
		});
		for (let i = 0; i < steps; i++) {
			await this.step(octopus);
			progressBar.update({
				progress: i / steps,
				title: `Running for ${steps} steps (cur score ${this.game.world.score}):`,
			});
		}
		progressBar.update({ progress: 1.0, title: `Running for ${steps} steps (cur score ${this.game.world.score}):` });
		term(`\nFinished running, final score: `).yellow(`${this.game.world.score}\n`);
		return this.game;
	}
}
