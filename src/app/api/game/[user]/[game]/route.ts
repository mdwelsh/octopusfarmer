export const runtime = "edge";

import { kv } from "@vercel/kv";
import { World, WorldData } from "@/lib/world";

type RouteSegment = { params: { user: string; game: string } };

/** Return the current state of the given game. */
export async function GET(
	req: Request,
	{ params }: RouteSegment
): Promise<Response> {
	const gameData = await kv.json.get(
		`user:${params.user}:game:${params.game}`,
		"$"
	);
	return new Response(JSON.stringify(gameData[0]), {
		headers: { "content-type": "application/json" },
		status: gameData ? 200 : 404,
	});
}

/** Update the state of the given game. */
export async function POST(
	req: Request,
	{ params }: RouteSegment
): Promise<Response> {
	try {
		// First check if the game is valid.
		const gameData = await kv.json.get(
			`user:${params.user}:game:${params.game}`,
			"$"
		);
		if (!gameData) {
			return new Response("Game not found", { status: 404 });
		}
		// Parse the request body.
		const body = await req.json();
		// We expect only an array [x, y] of coordinates.
		if (!Array.isArray(body) || body.length !== 2) {
			return new Response("Invalid request body", { status: 400 });
		}
		// Create world from the gameData.
		const worldData: WorldData = gameData[0].world;
		if (!worldData) {
			return new Response("Game not found", { status: 404 });
		}
		const world = new World(worldData);
		// Update the game state.
		world.moveOctopus(body[0], body[1]);
		world.update();
		// Write it back.
		const newWorldData = world.toWorldData();
		const newGameData = {
			gameId: params.game,
			world: newWorldData,
		};
		await kv.json.set(
			`user:${params.user}:game:${params.game}`,
			"$",
			newGameData
		);
		return new Response(JSON.stringify(newGameData), {
			headers: { "content-type": "application/json" },
		});
	} catch (e: any) {
		console.log(e);
		return new Response(JSON.stringify({error: e.message}), { status: 500 });
	}
}
