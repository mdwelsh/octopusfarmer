export const runtime = 'edge';

import { kv } from '@vercel/kv';
import { GameData, World, WorldData } from '@/lib/World';

type RouteSegment = { params: { game: string } };

/** Return the current state of the given game. */
export async function GET(req: Request, { params }: RouteSegment): Promise<Response> {
	const gameData = await kv.json.get(`game:${params.game}`, '$');
	return new Response(JSON.stringify(gameData ? gameData[0] : {}), {
		headers: { 'content-type': 'application/json' },
		status: gameData ? 200 : 404,
	});
}

/** Delete a game. */
export async function DELETE(req: Request, { params }: RouteSegment): Promise<Response> {
	await kv.del(`game:${params.game}`);
	return new Response('{}', {
		headers: { 'content-type': 'application/json' },
		status: 200,
	});
}

export type OctopusPosition = {
	x: number;
	y: number;
};

export type MoveData = {
	moves: number;
	octopus: OctopusPosition;
};

/** Move octopus and update game state. */
export async function POST(req: Request, { params }: RouteSegment): Promise<Response> {
	try {
		// Normally I would like to use the Redis transaction commands, but they don't
		// seem to be supported in Vercel KV (or rather, the underlying upstash/redis
		// package it is based on).

		// First check if the game is valid.
		const gameData = (await kv.json.get(`game:${params.game}`, '$')) as GameData[];
		if (!gameData) {
			throw new Error('Game not found');
		}
		// Parse the request body.
		const body = (await req.json()) as MoveData;
		// We expect the body to be a JSON object with "moves" and "octopus" keys.
		if (!body || typeof body !== 'object') {
			throw new Error('Invalid request body: expecting object');
		}
		const moves = body.moves;
		const octopus = body.octopus;
		if (typeof moves !== 'number' || typeof octopus !== 'object') {
			throw new Error('Invalid request body: expecting moves and octopus keys');
		}

		// Create world from the gameData.
		const worldData: WorldData = gameData[0].world;
		if (!worldData) {
			throw new Error('Unable to parse game data');
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
			await kv.json.set(`game:${params.game}`, '$', newGameData);
			return new Response(JSON.stringify(newGameData), {
				headers: { 'content-type': 'application/json' },
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
