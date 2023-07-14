import { GameData, MoveData, OctopusPosition, WorldData } from './types.js';

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
		const res = await fetch('/api/games', {
			method: 'POST',
		});
		if (!res.ok) {
			throw new Error(`Unable to create game: ${res}`);
		}
		return (await res.json()) as GameData;
	}

	async fetchGame(): Promise<GameData> {
		const res = await fetch(`/api/game/${this.gameId}`, {
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
		const res = await fetch(`/api/game/${this.gameId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(move),
		});
		if (!res.ok) {
			throw new Error(`Unable to move: ${res}`);
		}
        this.game = await res.json() as GameData;
		return this.game;
	}

    async step(octopus: OctopusFunction): Promise<GameData> {
        const newPosition = octopus(this.game);
        return await this.moveTo(newPosition.x, newPosition.y);
    }

    run(octopus: OctopusFunction, steps: number): GameData {
        for (let i = 0; i < steps; i++) {
            this.step(octopus);
        }
        return this.game;
    }
}
