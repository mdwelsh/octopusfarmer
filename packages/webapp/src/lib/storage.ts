import { kv } from '@vercel/kv';
import { GameDataInternal } from '@/lib/World';

/** Return the given game. */
export async function loadGame(gameId: string): Promise<GameDataInternal> {
	const gameDataInternal = (await kv.json.get(`game:${gameId}`, '$')) as GameDataInternal[];
	if (!gameDataInternal) {
		throw new Error('Game not found');
	}
	return gameDataInternal[0];
}

/** Store the given game. */
export async function saveGame(gameDataInternal: GameDataInternal): Promise<void> {
	await kv.json.set(`game:${gameDataInternal.gameId}`, '$', gameDataInternal);
}
