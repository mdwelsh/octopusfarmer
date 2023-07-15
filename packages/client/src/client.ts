import { GameData, MoveData, OctopusPosition, WorldData } from './types.js';

import terminal from 'terminal-kit';
const { terminal: term } = terminal;

type OctopusFunction = (_game: GameData) => OctopusPosition;

export class Client {
	url!: string;
	gameId!: string;
	game!: GameData;

	/** Use Create() instead. */
	constructor() {}

	public static async Create(url: string, gameId?: string | null): Promise<Client> {
		const client = new Client();
		client.url = url;
		if (gameId) {
			client.gameId = gameId;
			client.game = await client.fetchGame();
		} else {
			client.game = await client.newGame();
			client.gameId = client.game.gameId;
		}
		console.log(`Created client for game ${client.gameId}`);
		return client;
	}

	score(): number {
		return this.game.world.score;
	}

	moves(): number {
		return this.game.world.moves;
	}

	world(): WorldData {
		return this.game.world;
	}

	async newGame(): Promise<GameData> {
		const res = await fetch(`${this.url}/api/games`, {
			method: 'POST',
		});
		if (!res.ok) {
			throw new Error(`Unable to create game: ${res}`);
		}
		return (await res.json()) as GameData;
	}

	async fetchGame(): Promise<GameData> {
		const res = await fetch(`${this.url}/api/game/${this.gameId}`, {
			method: 'GET',
		});
		if (!res.ok) {
			throw new Error(`Unable to fetch game: ${res}`);
		}
		return res.json() as Promise<GameData>;
	}

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

	async step(octopus: OctopusFunction): Promise<GameData> {
		const newPosition = octopus(this.game);
		return await this.moveTo(newPosition.x, newPosition.y);
	}

	async run(octopus: OctopusFunction, steps: number): Promise<GameData> {
		term('Starting game ').blue(this.gameId)(' - live display: ').green(`${this.url}/game/${this.gameId}\n`);
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
