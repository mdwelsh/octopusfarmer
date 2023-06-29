export const runtime = "edge";

import { nanoid } from "nanoid";
import { kv } from "@vercel/kv";
import { World } from "@/lib/world";

type RouteSegment = { params: { user: string } };

/** Return the list of game IDs for this user. */
export async function GET(req: Request, { params }: RouteSegment): Promise<Response> {
	const games = await kv.scan(0, { match: `user:${params.user}:game:*` });
	const gameIds = games[1].map((key: string) => key.split(":")[3]);
	return new Response(JSON.stringify(gameIds), {
		headers: { "content-type": "application/json" },
		status: (gameIds.length > 0) ? 200 : 404,
	});
}

/** Create a new game. */
export async function POST(req: Request, { params }: RouteSegment): Promise<Response> {
	const gameId = nanoid();
	const world = new World(undefined, 100, 100);
	const worldData = world.toWorldData();
	const gameData = {
		gameId: gameId,
		world: worldData,
	};
	await kv.json.set(`user:${params.user}:game:${gameId}`, "$", gameData);
	return new Response(JSON.stringify(gameData), {
		headers: { "content-type": "application/json" },
	});
}
