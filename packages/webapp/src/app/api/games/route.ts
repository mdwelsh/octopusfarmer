export const runtime = 'edge';

import { nanoid } from 'nanoid';
import stringHash from 'string-hash';
import { kv } from '@vercel/kv';
import { World, GameDataInternal } from '@/lib/World';
import { GameData, GameMetadata, NewGameRequest } from 'octofarm-types';
import { loadGame, saveGame } from '@/lib/storage';

/** Return the game leaderboard. */
export async function GET(req: Request): Promise<Response> {
	// Scan all keys until the cursor value is 0.
	let gameIds: string[] = [];
	let cursor = 0;
	do {
		const games = await kv.scan(cursor, { match: `game:*` });
		cursor = games[0];
		const keys = games[1];
		keys.map((key: string) => {
			// Strip the "game:" prefix.
			key = key.substring(5);
			gameIds.push(key);
		});
	} while (cursor !== 0);

	// Return only the top ten games by score.
	const scores = await Promise.all(gameIds.map(async (gameId) => {
		return { gameId: gameId, score: parseInt((await kv.json.get(`game:${gameId}`, '$..score'))[0]) };
	}));
	scores.sort((a, b) => { return b.score - a.score; });

	let response: GameMetadata[] = [];
	for (const gameId of scores.slice(0, 10).map((score) => score.gameId)) {
		const gameDataInternal = await loadGame(gameId);
		const gameMetadata: GameMetadata = {
			hash: stringHash(gameId).toString(16),
			created: gameDataInternal.created,
			modified: gameDataInternal.modified,
			score: gameDataInternal.world.score,
			moves: gameDataInternal.world.moves,
		};
		response.push(gameMetadata);
	}
	return new Response(JSON.stringify(response), {
		headers: { 'content-type': 'application/json' },
		status: 200,
	});
}

/** Create a new game. */
export async function POST(req: Request): Promise<Response> {
	const gameId = nanoid();
	const body: unknown = await req.json();
	const newGameRequest: NewGameRequest = body as NewGameRequest;
	console.log(`Creating game ${gameId} with request ${JSON.stringify(newGameRequest)}`);
	const world = new World({ newGame: newGameRequest as NewGameRequest });
	const now = new Date().toISOString();

	// Internal representation.
	const gameDataInternal: GameDataInternal = {
		gameId: gameId,
		gameType: newGameRequest.gameType ?? 'normal',
		owner: newGameRequest.owner,
		seed: newGameRequest.seed,
		created: now,
		modified: now,
		world: world.toWorldDataInternal(),
	};
	await saveGame(gameDataInternal);

	// External representation.
	const gameData: GameData = {
		gameId: gameId,
		owner: newGameRequest.owner,
		created: now,
		modified: now,
		world: world.toWorldData(),
	};
	return new Response(JSON.stringify(gameData), {
		headers: { 'content-type': 'application/json' },
	});
}
