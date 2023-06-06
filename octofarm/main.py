#!/usr/bin/env python3

from time import time
from typing import cast, Any, Dict, Optional

import click
from rich.console import Console

console = Console()

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal
from textual.css.query import DOMQuery
from textual.reactive import reactive
from textual.screen import Screen
from textual.widget import Widget
from textual.widgets import Button, Footer, Label, Markdown

from rich.console import RenderableType
from rich.style import Style
from rich.text import Text

from textual.color import Gradient
from textual.events import Mount
from textual.widget import Widget


# The size of the game grid.
GRID_SIZE: int = 40
CELL_WIDTH: int = 3
CELL_HEIGHT: int = 1


class GameHeader(Widget):
    moves = reactive(0)
    score = reactive(0)

    def compose(self) -> ComposeResult:
        with Horizontal():
            yield Label(self.app.title, id="app-title")
            yield Label(id="moves")
            yield Label(id="score")

    def watch_moves(self, moves: int):
        self.query_one("#moves", Label).update(f"Moves: {moves}")

    def watch_score(self, score: int):
        self.query_one("#score", Label).update(f"Score: {score}")


class GameCell(Widget):
    DEFAULT_CSS = f"""
    GameCell {{
        width: {CELL_WIDTH};
        height: {CELL_HEIGHT};
        border: none;
        content-align: center middle;
        color: $accent;
    }}
    """

    @staticmethod
    def at(row: int, col: int) -> str:
        return f"cell-{row}-{col}"

    def __init__(self, row: int, col: int) -> None:
        super().__init__(id=self.at(row, col))
        self.row = row
        self.col = col

    def _on_mount(self, _: Mount) -> None:
        self._start_time = time()
        self.auto_refresh = 1 / 16

    def render(self) -> RenderableType:
        dot = "\u25CF"
        return Text.assemble("x", dot, "y")


class GameGrid(Widget):
    """The main playable grid of game cells."""

    DEFAULT_CSS = f"""
    GameGrid {{
        layout: grid;
        grid-size: {GRID_SIZE} {GRID_SIZE};
        layer: gameplay;
        width: {GRID_SIZE * 3};
        height: {GRID_SIZE * 1};
    }}"""

    def compose(self) -> ComposeResult:
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                yield GameCell(row, col)


class Game(Screen):
    BINDINGS = [
        Binding("n", "new_game", "New Game"),
        Binding("question_mark", "push_screen('help')", "Help", key_display="?"),
        Binding("q", "quit", "Quit"),
        Binding("up,w,k", "navigate(-1,0)", "Move Up", False),
        Binding("down,s,j", "navigate(1,0)", "Move Down", False),
        Binding("left,a,h", "navigate(0,-1)", "Move Left", False),
        Binding("right,d,l", "navigate(0,1)", "Move Right", False),
        Binding("space", "move", "Toggle", False),
    ]

    def game_playable(self, playable: bool) -> None:
        self.query_one(GameGrid).disabled = not playable

    def cell(self, row: int, col: int) -> GameCell:
        return self.query_one(f"#{GameCell.at(row,col)}", GameCell)

    def compose(self) -> ComposeResult:
        yield GameHeader()
        yield GameGrid()
        yield Footer()

    def toggle_cell(self, row: int, col: int) -> None:
        """Toggle an individual cell, but only if it's in bounds.

        If the row and column would place the cell out of bounds for the
        game grid, this function call is a no-op. That is, it's safe to call
        it with an invalid cell coordinate.

        Args:
            row (int): The row of the cell to toggle.
            col (int): The column of the cell to toggle.
        """
        if 0 <= row <= (GRID_SIZE - 1) and 0 <= col <= (GRID_SIZE - 1):
            self.cell(row, col).toggle_class("filled")

    _PATTERN = (-1, 1, 0, 0, 0)

    def toggle_cells(self, cell: GameCell) -> None:
        """Toggle a 5x5 pattern around the given cell.

        Args:
            cell (GameCell): The cell to toggle the cells around.
        """
        for row, col in zip(self._PATTERN, reversed(self._PATTERN)):
            self.toggle_cell(cell.row + row, cell.col + col)
        self.query_one(GameHeader).filled = self.filled_count

    def make_move_on(self, cell: GameCell) -> None:
        """Make a move on the given cell.

        All relevant cells around the given cell are toggled as per the
        game's rules.

        Args:
            cell (GameCell): The cell to make a move on
        """
        self.toggle_cells(cell)
        self.query_one(GameHeader).moves += 1
        if self.all_filled:
            self.game_playable(False)

    def action_new_game(self) -> None:
        """Start a new game."""
        self.query_one(GameHeader).moves = 0
        self.query_one(GameHeader).score= 0
        self.game_playable(True)

    def action_navigate(self, row: int, col: int) -> None:
        if isinstance(self.focused, GameCell):
            self.set_focus(
                self.cell(
                    (self.focused.row + row) % GRID_SIZE,
                    (self.focused.col + col) % GRID_SIZE,
                )
            )

    def action_move(self) -> None:
        """Make a move on the current cell."""
        if isinstance(self.focused, GameCell):
            self.focused.press()

    def on_mount(self) -> None:
        """Get the game started when we first mount."""
        self.action_new_game()



class Octofarm(App[None]):
    """Main App class."""

    CSS_PATH = "octofarm.css"

#    SCREENS = {"help": Help}
    """The pre-loaded screens for the application."""

    BINDINGS = [("ctrl+d", "toggle_dark", "Toggle Dark Mode")]
    """App-level bindings."""

    TITLE = "Octopus Farmer"

    def on_mount(self) -> None:
        """Set up the application on startup."""
        self.push_screen(Game())



@click.command()
def main():
    console.print(f"[red]Hello World!")
    Octofarm().run()


if __name__ == "__main__":
    main()
