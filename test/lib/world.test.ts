
import { World } from '@/src/lib/world';

test("World creation works", () => {
  const world = new World(undefined, 10, 10);
  expect(world.width).toBe(10);
  expect(world.height).toBe(10);
});