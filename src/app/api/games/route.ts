export const runtime = "edge";

import { kv } from "@vercel/kv";

export async function GET(req: Request): Promise<Response> {
	// XXX MDW TODO - Replace 100 with real user ID.
	const games = await kv.scan(0, { match: "user:100:game:*" });
	return new Response(JSON.stringify(games[1]), {
		headers: { "content-type": "application/json" },
	});
}

export async function POST(req: Request): Promise<Response> {
	const newGame = {
		moves: 0,
		score: 0,
	};
	await kv.json.set(`user:100:game:${Math.random()}`, "$", newGame);
	return new Response(JSON.stringify(newGame), {
		headers: { "content-type": "application/json" },
	});
}
