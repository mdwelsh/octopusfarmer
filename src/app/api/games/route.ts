export const runtime = "edge";

import { kv } from "@vercel/kv";

type GameMetadata = { userId: string, gameId: string };

/** Return the list of all games. */
export async function GET(req: Request): Promise<Response> {
    // Scan all keys until the cursor value is 0.
    let gameIds: GameMetadata[] = [];
    let cursor = 0;
    do {
        const games = await kv.scan(cursor, { match: `user:*` });
        gameIds = gameIds.concat(games[1].map((key: string) => {
            return {
                userId: key.split(":")[1],
                gameId: key.split(":")[3],
            };
        }));
        cursor = games[0];
    } while (cursor !== 0);
	return new Response(JSON.stringify(gameIds), {
		headers: { "content-type": "application/json" },
		status: gameIds.length > 0 ? 200 : 404,
	});
}
