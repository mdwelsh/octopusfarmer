
import { GameData, OctopusPosition } from './types.js';

/**
 * This is a very basic implementation of the octopus, which moves randomly.
 * You'll want to replace this with your own, much better, implementation.
 */
export function DumbOctopus(game: GameData): OctopusPosition {
	const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	const y = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	return { x, y } as OctopusPosition;
}