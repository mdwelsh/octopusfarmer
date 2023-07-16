export const runtime = 'edge';

import { nanoid } from 'nanoid';
import stringHash from 'string-hash';
import { kv } from '@vercel/kv';
import { World, GameDataInternal } from '@/lib/World';
import { GameData, GameMetadata } from 'octofarm-types';
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

	let response: GameMetadata[] = [];
	for (const gameId of gameIds) {
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

	// Sort by score, then by moves, then by modified date.
	response.sort((a, b) => {
		if (a.score !== b.score) {
			return b.score - a.score;
		}
		if (a.moves !== b.moves) {
			return a.moves - b.moves;
		}
		// Sort by modified date, most recent first.
		return new Date(b.modified).getTime() - new Date(a.modified).getTime();
	});

	return new Response(JSON.stringify(response), {
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
	await saveGame(gameDataInternal);

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
