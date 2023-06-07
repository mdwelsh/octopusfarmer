#!/usr/bin/env python3

from pathlib import Path
from time import time

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


WINDOW_SIZE: int = 40
CELL_WIDTH: int = 3
CELL_HEIGHT: int = 1

from game import World

WORLD = None


class GameHeader(Widget):
    moves = reactive(0)
    score = reactive(0)

    def compose(self) -> ComposeResult:
        with Horizontal():
            yield Label(self.app.title, id="app-title")
            yield Label(id="moves")

    def watch_moves(self, moves: int):
        self.query_one("#moves", Label).update(f"Moves: {moves}")


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
    value = reactive(" ")

    @staticmethod
    def at(row: int, col: int) -> str:
        return f"cell-{row}-{col}"

    def __init__(self, row: int, col: int) -> None:
        super().__init__(id=self.at(row, col))
        self.row = row
        self.col = col

    def _on_mount(self, _: Mount) -> None:
        self._start_time = time()

    def render(self) -> RenderableType:
        return self.value


class GameGrid(Widget):
    """The main playable grid of game cells."""

    DEFAULT_CSS = f"""
    GameGrid {{
        layout: grid;
        grid-size: {WINDOW_SIZE} {WINDOW_SIZE};
        layer: gameplay;
        width: {WINDOW_SIZE * 3};
        height: {WINDOW_SIZE * 1};
    }}"""

    def compose(self) -> ComposeResult:
        for row in range(WINDOW_SIZE):
            for col in range(WINDOW_SIZE):
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
    ]

    def cell(self, row: int, col: int) -> GameCell:
        return self.query_one(f"#{GameCell.at(row,col)}", GameCell)

    def compose(self) -> ComposeResult:
        yield GameHeader()
        yield GameGrid()
        yield Footer()

    def action_new_game(self) -> None:
        """Start a new game."""
        self.query_one(GameHeader).moves = 0
        self.query_one(GameHeader).score = 0

    def action_navigate(self, row: int, col: int) -> None:
        assert WORLD is not None
        WORLD.move_octopus(row, col)

    def on_mount(self) -> None:
        """Get the game started when we first mount."""
        self.action_new_game()
        self.update_timer = self.set_interval(1 / 5, self.update_world, pause=False)

    def update_world(self) -> None:
        """Update the world state."""
        assert WORLD is not None
        changed_cells = WORLD.update()
        self.query_one(GameHeader).moves = WORLD.moves
        for row, col in changed_cells:
            obj = WORLD.at(row, col)
            if obj is not None:
                self.cell(row, col).value = obj.render()
            else:
                self.cell(row, col).value = " "


class Help(Screen):
    BINDINGS = [("escape,space,q,question_mark", "pop_screen", "Close")]

    def compose(self) -> ComposeResult:
        yield Markdown(Path("octofarm/help.md").read_text())


class OctofarmUI(App[None]):
    CSS_PATH = "octofarm.css"
    SCREENS = {"help": Help}
    BINDINGS = [("ctrl+d", "toggle_dark", "Toggle Dark Mode")]
    TITLE = "Octopus Farmer"

    def __init__(self, world: World) -> None:
        global WORLD
        WORLD = world
        super().__init__()

    def on_mount(self) -> None:
        """Set up the application on startup."""
        self.push_screen(Game())
