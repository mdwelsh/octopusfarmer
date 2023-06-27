export const runtime = 'edge';

import { kv } from "@vercel/kv";

type RouteSegment = { params: { id: string } };

export async function GET(req: Request, { params }: RouteSegment): Promise<Response> {
  const gameData = await kv.json.get(`user:100:game:${params.id}`, '$');
  return new Response(JSON.stringify(gameData), {
    headers: { 'content-type': 'application/json' },
  });
}