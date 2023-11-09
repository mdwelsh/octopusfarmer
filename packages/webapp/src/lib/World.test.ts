import { jest } from '@jest/globals';

import { World } from './World';

test('New world created correctly', () => {
	const world = new World({ newGame: { owner: 'me', gameType: 'normal' } });
	expect(world).toBeInstanceOf(World);
	expect(world.data.height).toBe(500);
	expect(world.data.width).toBe(500);
});
