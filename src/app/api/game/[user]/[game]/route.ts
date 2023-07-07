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
	return new Response(JSON.stringify(gameData ? gameData[0] : {}), {
		headers: { "content-type": "application/json" },
		status: gameData ? 200 : 404,
	});
}

/** Delete a game. */
export async function DELETE(
	req: Request,
	{ params }: RouteSegment
): Promise<Response> {
	await kv.delete(`user:${params.user}:game:${params.game}`);
	return new Response("{}", {
		headers: { "content-type": "application/json" },
		status: 204,
	});
}

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/** Move octopus and update game state. */
export async function POST(
	req: Request,
	{ params }: RouteSegment
): Promise<Response> {
	try {
		// Normally I would like to use the Redis transaction commands, but they don't
		// seem to be supported in Vercel KV (or rather, the underlying upstash/redis
		// package it is based on).

		// First check if the game is valid.
		const gameData = await kv.json.get(
			`user:${params.user}:game:${params.game}`,
			"$"
		);
		if (!gameData) {
			throw new Error("Game not found");
		}
		// Parse the request body.
		const body = await req.json();
		// We expect the body to be a JSON object with "moves" and "octopus" keys.
		if (!body || typeof body !== "object") {
			throw new Error("Invalid request body: expecting object");
		}
		const moves = body.moves;
		const octopus = body.octopus;
		if (typeof moves !== "number" || typeof octopus !== "object") {
			throw new Error("Invalid request body: expecting moves and octopus keys");
		}
		console.log(`MDW: Processing: body ${moves}, game ${gameData[0].world.moves}`);

		// XXX MDW HACKING
		await sleep(250);

		// Create world from the gameData.
		const worldData: WorldData = gameData[0].world;
		if (!worldData) {
			throw new Error("Unable to parse game data");
		}
		const world = new World(worldData);

		if (moves == world.moves) {
			// Update the game state.
			world.moveOctopus(body.octopus.x, body.octopus.y);
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
		} else {
			console.log(`Dropping concurrent update for moves=${moves} world.moves=${world.moves}`);
			throw new Error(`Ignoring concurrent update for moves=${moves} world.moves=${world.moves}`);
		}
	} catch (e: any) {
		console.log(e);
		return new Response(JSON.stringify({ error: e.message }), { status: 400 });
	}
}