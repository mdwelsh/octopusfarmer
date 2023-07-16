export const runtime = 'edge';

import { nanoid } from 'nanoid';
import { kv } from '@vercel/kv';
import { World, GameDataInternal } from '@/lib/World';
import { GameData } from 'octofarm-types';

type GameMetadata = { gameId: string };

/** Return the list of all games. */
export async function GET(req: Request): Promise<Response> {
	// Scan all keys until the cursor value is 0.
	let gameIds: GameMetadata[] = [];
	let cursor = 0;
	do {
		const games = await kv.scan(cursor, { match: `game:*` });
		gameIds = gameIds.concat(
			games[1].map((key: string) => {
				return {
					gameId: key.split(':')[1],
				};
			})
		);
		cursor = games[0];
	} while (cursor !== 0);
	return new Response(JSON.stringify(gameIds), {
		headers: { 'content-type': 'application/json' },
		status: 200,
	});
}

/** Create a new game. */
export async function POST(req: Request): Promise<Response> {
	const gameId = nanoid();
	const world = new World(undefined, 100, 100);
	const now = new Date().toISOString();

	// Internal representation.
	const gameDataInternal: GameDataInternal = {
		gameId: gameId,
		created: now,
		modified: now,
		world: world.toWorldDataInternal(),
	};
	await kv.json.set(`game:${gameId}`, '$', gameDataInternal);

	// External representation.
	const gameData: GameData = {
		gameId: gameId,
		created: now,
		modified: now,
		world: world.toWorldData(),
	};
	return new Response(JSON.stringify(gameData), {
		headers: { 'content-type': 'application/json' },
	});
}
