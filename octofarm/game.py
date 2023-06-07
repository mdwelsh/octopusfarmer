#!/usr/bin/env python3

import random
from rich.console import Console

console = Console()

WORLD_WIDTH = 40
WORLD_HEIGHT = 40


class Food:
    next_id = 0
    def __init__(self, glyph: str, x: int, y: int, value: int, health: int):
        self.id = Food.next_id
        self.glyph = glyph
        Food.next_id += 1
        self.x = x
        self.y = y
        self.value = value
        self.health = health

    def move_to(self, x: int, y: int):
        self.x = min(WORLD_WIDTH-1, max(x, 0))
        self.y = min(WORLD_HEIGHT-1, max(y, 0))

    def render(self):
        return self.glyph


class FoodGroup:
    def __init__(self, glyph: str, center_x: int, center_y: int, radius: int, num_foods: int, value: int):
        self.glpyh = glyph
        self.center_x = center_x
        self.center_y = center_y
        self.radius = radius
        self.value = value
        self.foods = [
            Food(
                glyph,
                center_x + random.randint(-radius, radius),
                center_y + random.randint(-radius, radius),
                value,
                100,
            )
            for _ in range(num_foods)
        ]

    def update(self):
        for food in self.foods:
            food.move_to(food.x + random.randint(-1, 1), food.y + random.randint(-1, 1))


class Octopus:
    def __init__(self, world, x: int, y: int, tentacles: int, reach: int):
        self.world = world
        self.x = x
        self.y = y
        self.tentacles = tentacles
        self.reach = reach

    def update(self):
        pass

    def render(self):
        return "🐙"


class World:
    def __init__(self):
        self._octopus = Octopus(self, WORLD_WIDTH // 2, WORLD_HEIGHT // 2, 8, 3)
        self._foodgroups = []
        self._foodgroups.append(FoodGroup("🐟", 5, 5, 5, 5, 10))
        self._foodgroups.append(FoodGroup("🐠", 30, 15, 3, 5, 10))
        self._foodgroups.append(FoodGroup("🐡", 20, 30, 4, 10, 10))
        self.moves = 0
        self.cells = [[None for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]

    def move_octopus(self, row: int, col: int):
        self._octopus.x = min(WORLD_WIDTH-1, max(self._octopus.x + col, 0))
        self._octopus.y = min(WORLD_HEIGHT-1, max(self._octopus.y + row, 0))

    def update(self):
        self.moves += 1
        self.last_cells = self.cells
        self.cells = [[None for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]

        for foodgroup in self._foodgroups:
            foodgroup.update()
            for food in foodgroup.foods:
                self.cells[food.y][food.x] = food
        self.cells[self._octopus.y][self._octopus.x] = self._octopus

        # Return only the cells that have changed.
        changed_cells = []
        for row in range(WORLD_HEIGHT):
            for col in range(WORLD_WIDTH):
                if self.cells[row][col] != self.last_cells[row][col]:
                    changed_cells.append((row, col))
        return changed_cells

    def at(self, row, col):
        return self.cells[row][col]
        
