"""This module defines the types used by the Octopus Farmer game API."""

import dataclasses
import enum
from typing import Dict, List, Optional

import dataclasses_json


class CamelCaseJsonMixin(dataclasses_json.DataClassJsonMixin):
    """Utility class for conversion to/from camel case for field names."""
    dataclass_json_config = dataclasses_json.config(
        letter_case=dataclasses_json.LetterCase.CAMEL
    )[
        "dataclasses_json"
    ]  # type: ignore


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class NewGameRequest(CamelCaseJsonMixin):
    """A request to create a new game."""

    owner: str
    # Must be "test", "easy", "normal", "hard", or "insane".
    game_type: Optional[str] = None
    seed: Optional[int] = None


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class TentacleData(CamelCaseJsonMixin):
    """The fish ID being grabbed by this tentacle."""

    fish_id: Optional[str] = None


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class FishData(CamelCaseJsonMixin):
    """Represents a single fish."""

    id: str
    x: int
    y: int
    value: int
    health: int


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class OctopusData(CamelCaseJsonMixin):
    """Represents the state of the octpus."""

    x: int
    y: int
    speed: int
    reach: int
    attack: int
    tentacles: List[Optional[TentacleData]]


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class TrapData(CamelCaseJsonMixin):
    """Represents a single trap."""

    x: int
    y: int
    radius: int


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class WorldData(CamelCaseJsonMixin):
    """The overall world state."""

    width: int
    height: int
    moves: int
    score: int
    octopus: OctopusData
    fish: List[FishData]
    traps: Optional[List[TrapData]] = None


@dataclasses_json.dataclass_json
@dataclasses.dataclass
class GameData(CamelCaseJsonMixin):
    """State for a single game."""

    game_id: str
    owner: str
    created: str
    modified: str
    world: WorldData
