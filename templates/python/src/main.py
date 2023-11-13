#!/usr/bin/env python

import random
from typing import Optional

import api
import client

# Please edit the following with your email address.
YOUR_EMAIL = 'me@somewhere.com'
# If you want a repeatable game state for debugging, you can change this to a number.
SEED: Optional[int] = None
# You are welcome to change this to one of the
# game types: 'test', 'easy', 'normal', 'hard', or 'insane'.
GAME_TYPE = "normal"
# Don't edit this unless you are debugging against
# a test server (not something we expect you to do).
SERVER_URL = "https://octopusfarmer.com"
# Feel free to reduce this for testing.
GAME_STEPS = 1000

# Your job is to replace the code below with a much better implementation.
def my_octopus(game: api.GameData) -> client.OctopusPosition:
    x = game.world.octopus.x + random.choice([-1, 1])
    y = game.world.octopus.y + random.choice([-1, 1])
    return client.OctopusPosition(x=x, y=y)


# You shouldn't need to edit anything below this line.
new_game_request = api.NewGameRequest(owner=YOUR_EMAIL, game_type=GAME_TYPE, seed=SEED)
c = client.Client(SERVER_URL, new_game=new_game_request)
c.run(my_octopus, 100)

