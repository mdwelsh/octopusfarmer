export const runtime = 'edge';

import { kv } from '@vercel/kv';
import { World } from '@/lib/World';
import { GameData, WorldData } from 'octofarm-types';
import { GameDataInternal, WorldDataInternal } from '@/lib/World';

type RouteSegment = { params: { game: string } };

/** Return the given game. */
async function getGame(gameId: string): Promise<GameDataInternal> {
	const gameDataInternal = (await kv.json.get(`game:${gameId}`, '$')) as GameDataInternal[];
	if (!gameDataInternal) {
		throw new Error('Game not found');
	}
	return gameDataInternal[0];
}

/** Return the current state of the given game. */
export async function GET(req: Request, { params }: RouteSegment): Promise<Response> {
	const gameDataInternal = await getGame(params.game);
	const world = new World(gameDataInternal.world);
	const gameData: GameData = {
		gameId: params.game,
		created: gameDataInternal.created,
		modified: gameDataInternal.modified,
		world: world.toWorldData(),
	};
	return new Response(JSON.stringify(gameData), {
		headers: { 'content-type': 'application/json' },
		status: 200,
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

		// Get the game world state.
		const gameDataInternal = await getGame(params.game);
		const world = new World(gameDataInternal.world);

		if (moves == world.moves) {
			// Update the game state.
			world.moveOctopus(body.octopus.x, body.octopus.y);
			world.update();

			// Write it back.
			const newGameDataInternal: GameDataInternal = {
				gameId: params.game,
				created: gameDataInternal.created,
				modified: new Date().toISOString(),
				world: world.toWorldDataInternal(),
			};
			await kv.json.set(`game:${params.game}`, '$', newGameDataInternal);

			// Send reply.
			const newGameData: GameData = {
				gameId: params.game,
				created: newGameDataInternal.created,
				modified: newGameDataInternal.modified,
				world: world.toWorldData(),
			};
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
