export const runtime = 'edge';

import { kv } from '@vercel/kv';
import { loadGame } from '@/lib/storage';

/** Remove old or incomplete games. */
export async function POST(req: Request): Promise<Response> {
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

	// Age threshold for games is 30 days.
	var threshold = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;

	for (const gameId of gameIds) {
		const gameDataInternal = await loadGame(gameId);
		const modified = new Date(gameDataInternal.modified).getTime();
		if (
			!gameDataInternal.created ||
			!gameDataInternal.modified ||
			!gameDataInternal.world.moves ||
			modified < threshold
		) {
			console.log(`Purging game ${gameId}`);
			await kv.del(`game:${gameId}`);
		}
	}
	return new Response(JSON.stringify({}), {
		headers: { 'content-type': 'application/json' },
		status: 200,
	});
}
