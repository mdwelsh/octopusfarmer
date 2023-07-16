# Octopus Farmer 🐙🌱

This is a web-based game in which you play as an octopus that attempts to catch fish
with its tentacles. Each fish consumed gives you a certain number of points, and your goal is
to maximize the number of points you get within a certain number of time steps, by writing the
best code you can to optimize the octopus's movement.

The game itself is hosted on https://octopusfarmer.com and is accessed through a simple REST
API, described below. Your job is to write a client program that interacts with this API to
create a game and control the octopus to maximize your score.

The server code itself can be found in the `packages/webapp` directory of this repo.
You are not to modify the server in any way.

There is an example client, written in TypeScript, in the `packages/client` directory.
Your own client code can be in any language you like.

## Quick test

The example client code is incredibly dumb and moves the octopus randomly, which is not
expected to yield a very good score. But, you can run it to test that everything is working
for you as follows:

```bash
$ git clone https://github.com/mdwelsh/octopusfarmer
$ cd octopusfarmer
$ yarn
$ yarn workspace client build-start run -s 10
Created client for game NS_f3wnwuUsIzgEfSjSVQ
Starting game NS_f3wnwuUsIzgEfSjSVQ - live display: https://octopusfarmer.com/game/NS_f3wnwuUsIzgEfSjSVQ
Running for 10 steps (cur score 0):     100%[==============================================================>] done
Finished running, final score: 0
```

Here, the `-s 10` flag tells the client to run for only 10 steps, which is too short for the
octopus to catch any fish, so the final score should be 0.

## How the game works

The game world consists of a rectangular grid of cells of dimension `width` x `height` .
The top-left cell is (0, 0) and the bottom-right cell is ( `width-1` , `height-1` ).

There are a number of fish happily swimming around in the world, each with a different
point value and differing amounts of health. The octopus starts at a random location 
near the middle of the game world. As fish are consumed, new fish will occasionally spawn
in the world to replace them.

A given cell in the world can be occupied by any number of fish, as well as the octopus, at
a given time. There is no concept of collisions in this game.

The octopus has a number of tentacles, each of which can grab a single fish at a time. The
octopus can only grab fish that are within a certain distance of the octopus. If a fish is
grabbed by a tentacle, it will be held by that tentacle until it is killed or it moves out
of range of the octopus.

On each time step, each fish that is held by a tentacle will have `attack` units subtracted from
its health. If a fish's health drops to 0 or below, the fish is killed and the game score
increases by the fish's point value. This means that it will typically take multiple time
steps of holding a fish in order to kill it. Also, a fish will tend to swim away from the
octopus when it is grabbed by a tentacle, and if the fish swims out of range of the
octopus, it will be released by the tentacle and immediately restore to full health.
Therefore, there is an opportunity cost to allowing a fish to swim away!

On each time step, the octopus may move up to `speed` distance units from its current position.
The octopus will automatically grab fish that are within `reach` distance units of itself with
its empty tentacles. The octopus will attempt to grab the closest fish first.

Your job is to write code that moves the octopus to maximize your score after 1000 time steps.

## The REST API

The REST API for the Octopus Farmer game is very simple and is described below.

### Creating a game

To create a game, make a POST request to `https://octopusfarmer.com/api/games` with an empty body.
The response will be a JSON object containing the properties:

* `gameId`: the unique identifier for the game.
* `world`: the initial state of the game world, as described below.

The `gameId` field is a secret token that represents your game -- keep it
private! Anyone can use this `gameId` to interact with the game world (by
moving your octopus), so don't share it with anyone.

You can create as many games as you like. The state of the game world is
random for each game you create. We delete games that have not been updated
in more than 30 days.

### Aside: Game world visualizer

We provide a web-based visualization of the state of the game world at
this URL:

```
https://octopusfarmer.com/game/<gameId>
```

where `<gameId>` is the unique identifier for the game. This page will
show a graphical representation of the game, how many moves have been
made, the current positions of the octopus, fish, etc. It updates live
so if you are running your client code, you can see the state of the
game world change in real time.

### Getting the current state of the game

To get the current state of the game, make a GET request to `https://octopusfarmer.com/api/game/<gameId>` , 
where `<gameId>` is the unique identifier for the game. The response will be a JSON object containing
the properties:

* `gameId`: the unique identifier for the game.
* `world`: the current state of the game world, as described below.

### Moving the Octopus

To move the octopus, make a POST request to `https://octopusfarmer.com/api/game/<gameId>` with
a JSON body containing the following:

```
{
  "octopus": {
    "x": <x position to move to>,
    "y": <y position to move to>
  },
  "moves": <current value of world.moves property>
}
```

where `<gameId>` is the unique identifier for the game. The `x` and `y` properties of the `octopus` object should be the X and Y coordinates where the octopus should move.

Note that you do not have control over which fish, if any, the octopus will grab with its tentacles; 
all you control is the position of the octopus. Note that the octopus may only move up to a certain
distance from its current position on each move, according to the `octopus.speed` property in the
world state. If you attempt to move the octopus too far, the server will return an error.

The `moves` property should contain the most recent value of the `moves` property from the
world state, as described in further detail below. This is a simple check to ensure that you
are not making moves based on stale information; if you send a move with a stale `moves` value, 
the server will return an error.

Upon a successful move, the server will return a JSON object containing the properties:

* `gameId`: the unique identifier for the game.
* `world`: the updated state of the game world, as described below.

## The world state object

The state of the game world is reflected in the `world` object returned by the API. It contains
information about the size of the world, the location of each fish, and the location of the
octopus.

```
{
  "width": <width of the world in cells>,
  "height": <height of the world in cells>,
  "moves": <number of moves made so far>,
  "score": <current score>,
  "fish": [ ... Described below ... ],
  "octopus": { ... Described below ... }
}
```

The world is a rectangular grid of cells, with the top-left cell being (0, 0) and the
bottom-right being ( `width-1`, `height-1`). The octopus and any number of fish can
occupy a single cell at one time; there is no concept of collisions in this game.

The `moves` parameter represents the number of moves made by the octopus so far in this
game.

The `score` parameter represents the current score of the octopus. Each time the octopus
successfully kills a fish, the octopus's score is increased by the value of that fish.
(As you might expect, different fish have different values.)

### The fish

There are a number of fish happily swimming around in the world, each with a different
point value and differing amounts of health. The fish are represented in the `fish` array
of the world state object, as so:

```
{
  ...
  "fish": [
    {
      "id": <unique identifier for the fish>,
      "x": <x position of the fish>,
      "y": <y position of the fish>,
      "value": <point value of the fish>,
      "health": <current health of the fish>,
    },
    ...
  ]
}
```

The fish move somewhat randomly, but will tend to swim away from the octopus if grabbed by
one of its tentacles. The `health` property of the fish represents the amount of damage
that the fish can take before dying. When the fish's health drops to zero, the octopus
eats it, and the fish is removed from the game, and `fish.value` points are added to the
world's `score` .

### The octopus state object

The octopus is represented in the world state as follows:

```
{
  ...
  "octopus": {
    "x": <x position of the octopus>,
    "y": <y position of the octopus>,
    "speed": <maximum distance the octopus can move in a single step>,
    "reach": <maximum distance that the octopus' tentacles can reach>,
    "attack": <amount of damage done to a fish per time step when grabbed by a tentacle>,
    "tentacles": [ <fishID or null for each tentacle> ]
  }
}
```

The `x` and `y` properties of the octopus represent the octopus's current position in the
world. The `speed` property represents the maximum distance that the octopus can move in a
single time step. The `reach` property represents the maximum distance that the octopus's
tentacles can reach. The `attack` property represents the amount of damage done to a fish
per time step when grabbed by a tentacle.

Note that the `speed` , `reach` , and `attack` properties will not change during the game.
(In a future version, we may add the ability to upgrade the octopus's abilities during the
game, but for now, these values are constant.)

The `tentacles` array has one entry, one for each tentacle. The value of each entry
is either a `fishId` or `null` . If the value is `null` , then the tentacle is not
currently grabbing a fish. If it is a `fishId` , then the tentacle is grabbing the fish
with the ID `fishId` .

## A simple implementation

We provide a simple implementation in TypeScript that you can use as a
starting point. Note that there is no need to write your own code in
TypeScript; this is provided only as an example.

The code in `packages/client/src/main.ts` has a simple implementation of an octopus that moves randomly. It is not very effective, but it does
demonstrate the basic mechanics of the game.

```typescript
function dumbOctopus(game: GameData): OctopusPosition {
	const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	const y = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	return { x: x, y: y } as OctopusPosition;
}
```

Here, the `dumbOctopus` function is invoked with the current game state
( `game: GameData` ), and returns an `OctopusPosition` object, which has
the proposed `x` and `y` coordinates for the octopus.

`dumbOctopus` is invoked as a callback on each time step by the
`Client.run()` function:
  

```typescript
const url = "https://octopusfarmer.com";
const gameId = "< game ID from a POST to /api/games >";
const client = await Client.Create(url, gameId);
client.run(dumbOctopus, 1000);
```

Good luck!
