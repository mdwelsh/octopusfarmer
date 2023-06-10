#!/usr/bin/env python3

import math
import random
from rich.console import Console

console = Console()

WORLD_WIDTH = 40
WORLD_HEIGHT = 40


class Food:
    next_id = 0

    def __init__(
        self, world: "World", glyph: str, x: int, y: int, value: int, health: int
    ):
        self.id = Food.next_id
        Food.next_id += 1

        self.world = world
        self.glyph = glyph
        self.x = x
        self.y = y
        self.value = value
        self.health = health
        self.max_health = health

    def move_to(self, x: int, y: int):
        self.x = min(WORLD_WIDTH - 1, max(x, 0))
        self.y = min(WORLD_HEIGHT - 1, max(y, 0))

    def under_attack(self):
        return self in self.world.octopus.tentacles

    def render(self):
        if self.under_attack():
            return f"[red]{self.glyph}[/red]"
        else:
            return self.glyph


class FoodGroup:
    def __init__(
        self,
        world: "World",
        glyph: str,
        center_x: int,
        center_y: int,
        radius: int,
        num_foods: int,
        value: int,
    ):
        self.world = world
        self.glpyh = glyph
        self.center_x = center_x
        self.center_y = center_y
        self.radius = radius
        self.value = value
        self.foods = [
            Food(
                world,
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
    def __init__(
        self, world, x: int, y: int, tentacles: int, reach: int, attack_power: int
    ):
        self.world = world
        self.x = x
        self.y = y
        self.num_tentacles = tentacles
        self.reach = reach
        self.attack_power = attack_power

        self.tentacles = [None for _ in range(tentacles)]

    def distance(self, x, y) -> float:
        return math.sqrt(abs(self.x - x) ** 2 + abs(self.y - y) ** 2)

    def can_reach(self, x, y) -> bool:
        return self.distance(x, y) <= self.reach

    def move(self):
        """Move the Octopus. This will be overridden by subclasses."""
        pass

    def update(self):
        # Execute move.
        self.move()

        # Check if our tentacles are still in range.
        for index, tentacle in enumerate(self.tentacles):
            if tentacle is not None and not self.can_reach(tentacle.x, tentacle.y):
                # Food went out of range.
                tentacle.health = tentacle.max_health
                self.tentacles[index] = None

        # Sort foods by distance to ourselves.
        foods = sorted(
            [
                food
                for foodgroup in self.world.foodgroups
                for food in foodgroup.foods
                if self.can_reach(food.x, food.y)
            ],
            key=lambda food: self.distance(food.x, food.y),
        )
        for food in foods:
            if food in self.tentacles:
                # We're already grabbing it.
                continue
            grabbed = False
            for index, tentacle in enumerate(self.tentacles):
                if tentacle is None:
                    # Started to grab it.
                    grabbed = True
                    self.tentacles[index] = food
                    break
            if not grabbed:
                # No free tentacles.
                break

        # Attack.
        for tentacle in self.tentacles:
            if tentacle:
                tentacle.health -= self.attack_power
                # XXX MDW - Check for death, update score.


    def render(self):
        return "🐙"


class World:
    def __init__(self):
        self.octopus = Octopus(self, WORLD_WIDTH // 2, WORLD_HEIGHT // 2, 8, 12, 1)
        self.foodgroups = [
            FoodGroup(self, "🐟", 5, 5, 5, 5, 10),
            FoodGroup(self, "🐠", 30, 15, 3, 5, 10),
            FoodGroup(self, "🐡", 20, 30, 4, 10, 10),
        ]
        self.moves = 0
        self.cells = [[None for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]

    def move_octopus(self, row: int, col: int):
        self.octopus.x = min(WORLD_WIDTH - 1, max(self.octopus.x + col, 0))
        self.octopus.y = min(WORLD_HEIGHT - 1, max(self.octopus.y + row, 0))

    def update(self):
        self.moves += 1
        self.last_cells = self.cells
        self.cells = [[None for _ in range(WORLD_WIDTH)] for _ in range(WORLD_HEIGHT)]

        # Update food.
        for foodgroup in self.foodgroups:
            foodgroup.update()
            for food in foodgroup.foods:
                self.cells[food.y][food.x] = food
        self.cells[self.octopus.y][self.octopus.x] = self.octopus

        # Update octopus.
        self.octopus.update()

        # Return only the cells that have changed.
        changed_cells = []
        for row in range(WORLD_HEIGHT):
            for col in range(WORLD_WIDTH):
                if self.cells[row][col] != self.last_cells[row][col]:
                    changed_cells.append((row, col))
        return changed_cells

    def at(self, row, col):
        return self.cells[row][col]
