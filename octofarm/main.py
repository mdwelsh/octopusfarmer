#!/usr/bin/env python3

from time import time
from typing import cast, Any, Dict, Optional

import click
from rich.console import Console

console = Console()

from game import World
from ui import OctofarmUI


@click.command()
def main():
    world = World()
    OctofarmUI(world).run()


if __name__ == "__main__":
    main()
