#!/usr/bin/env python3

from time import time
from typing import cast, Any, Dict, Optional

import click
from rich.console import Console

console = Console()

from game import World
from ui import OctofarmUI


@click.group()
def main():
    pass


@main.command()
def run():
    world = World()
    OctofarmUI(world).run()


@main.command()
@click.option("--num-iterations", default=10000, help="Number of iterations to run")
def simulate(num_iterations: int):
    console.print(f"Simulating {num_iterations} iterations...")
    world = World()
    for _ in range(num_iterations):
        world.update()
    console.print(f"Done.")


if __name__ == "__main__":
    main()
