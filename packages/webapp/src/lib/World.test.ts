import { jest } from '@jest/globals';

import { World } from './World';

test('New world created correctly', () => {
	const world = new World(undefined, 200, 200);
	expect(world).toBeInstanceOf(World);
	expect(world.height).toBe(200);
	expect(world.width).toBe(200);
});
