import dataclasses
from typing import Callable, Optional

import requests
from rich.console import Console
from rich.progress import track
from rich.progress import Progress, SpinnerColumn, TimeElapsedColumn

import api

console = Console()


@dataclasses.dataclass
class OctopusPosition:
    """Represents the desired position of the Octopus returned by an OctopusFunction."""

    x: int
    y: int


OctopusFunction = Callable[[api.GameData], OctopusPosition]
"""An OctopusFunction takes the current GameData as an argument, and returns
the desired position of the Octopus."""


class Client:
    """A simple client for the Octopus Farmer game."""

    def __init__(
        self,
        url: str,
        game_id: Optional[str] = None,
        new_game: Optional[api.NewGameRequest] = None,
    ):
        self._url = url
        if game_id:
            self._game_id = game_id
            self._game = self._fetch_game()
        else:
            assert new_game
            self._game = self._new_game(new_game)
            self._game_id = self._game.game_id

    @property
    def score(self) -> int:
        return self._game.world.score

    @property
    def moves(self) -> int:
        return self._game.world.moves

    @property
    def world(self) -> api.WorldData:
        return self._game.world

    def preview_url(self) -> str:
        """Returns the URL of the game visualizer for this game."""
        return f"{self._url}/game/{self._game_id}"

    def _new_game(self, req: api.NewGameRequest) -> api.GameData:
        """Start a new game."""
        import json
        resp = requests.post(f"{self._url}/api/games", json=req.to_dict())
        resp.raise_for_status()
        return api.GameData.from_dict(resp.json())

    def _fetch_game(self) -> api.GameData:
        """Fetch an existing game."""
        resp = requests.get(f"{self._url}/api/game/{self._game_id}")
        resp.raise_for_status()
        return api.GameData.from_dict(resp.json())

    def moveTo(self, x: int, y: int) -> api.GameData:
        resp = requests.post(
            f"{self._url}/api/game/{self._game_id}",
            json={"moves": self._game.world.moves, "octopus": {"x": x, "y": y}},
        )
        resp.raise_for_status()
        game = api.GameData.from_dict(resp.json())
        self._game = game
        return game

    def step(self, octopus: OctopusFunction) -> api.GameData:
        """Run a single step of the game."""
        new_position = octopus(self._game)
        return self.moveTo(new_position.x, new_position.y)

    def run(self, octopus: OctopusFunction, steps: int) -> api.GameData:
        """Run the game for the given number of steps."""

        console.print(
            f"Starting game {self._game_id} - live display: [green]{self.preview_url()}[/green]"
        )
        progress = Progress(
            SpinnerColumn(),
            *Progress.get_default_columns(),
            TimeElapsedColumn(),
        )
        with progress:
            task = progress.add_task(
                f"[green]Running game for {steps} steps...", total=steps
            )
            for _ in range(steps):
                self.step(octopus)
                progress.update(task, advance=1)

        console.print(f"Final score: {self.score}")

        return self._game
