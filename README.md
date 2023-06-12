# Octopus Farmer 🐙🌱

This is a little text-based game in which you play as an octopus that attempts to catch fish
with its tentacles. Each fish consumed gives you a certain number of points, and your goal is
to maximize the number of points you get within a certain number of time steps, by writing the
best code you can to optimize the octopus's movement.

## Installation

```bash
$ npm install && npm run build
```

## Running the program

```bash
$ node ./dist/octofarm.js
```

There are two ways to run the game.
* `node ./dist/octofarm.js run` will run the game with a live, text-based display showing the
octopus, fish, and current score. You can control the octopus with the arrow keys.
* `node ./dist/octofarm.js farm` will run the game in a headless mode, only showing the
summary statistics. This is much faster and good for testing your octopus logic over a long
run.

## Your job: Writing the `MyOctopus` class

The file `src/octopus.ts` has the code for the `Octopus` class, which is the base class for
octopuses. Your job is to write a subclass of `Octopus` called `MyOctopus` that implements
the `move` method. The `move` method is called once per time step, and should move the octopus
in a way that maximizes the number of points it gets.

The default implementation of `MyOctopus` is to move randomly, which is not very effective.

The Octopus can move up to `this.speed` units each time step. The Octopus has a total of
`this.num_tentacles` tentacles, and each tentacle can reach a fish up to `this.reach` units
away. As the Octopus moves, the game will automatically cause the Octopus to grab the nearest
fish (within `this.reach` units away) with one of its free tentacles. Each time step that a
fish is grabbed by a tentacle, the fish loses `this.attack_power` health. If the fish's health
drops to 0, the fish is eaten and the Octopus gets `fish.value` points added to its score.
(All of the above logic is automated by the game; you don't have to implement this!)

Note that fish themselves move and some of them tend to move away from the Octopus when 
grabbed by a tentacle. If a fish moves beyond `this.reach` units, the Octopus will automatically
drop the fish, *and* the fish will automatically be restored to full health! Given that it
may take several time units of grabbing onto a fish with a tentacle to kill it, you may
want to consider having your octopus move closer to fish it has already grabbed, lest it lose
the points for fish that try to swim away.

### Moving the Octopus

The Octopus can use the following methods to help it move:
* `this.x` and `this.y` are the octopus's current coordinates.
* `this.moveTo(x, y)` will move the octopus to the given coordinates, as long as those coordinates
are within `this.speed` units of the octopus's current position. (If you attempt to move too far, 
the octopus will not move at all.)
* `this.moveLeft()`,  `this.moveRight()`,  `this.moveUp()`, and `this.moveDown()` will move the
octopus `this.speed` units in the given direction.
* `this.distance(x, y)` returns the distance between the octopus's current position and the given
coordinates.

### Eating fish

The Octopus will want to observe the state of the fish in the world and try to maximize
its points by moving towards the tastiest fish. You can use the following methods to help:

* `this.world.getFish()` returns an array of all the fish in the world. Each fish is an
instance of the `Fish` class, as described below.
* `this.tentacles` is an array containing each of the fish that the octopus is currently
grabbing with its tentacles. There can be no more than `this.num_tentacles` fish in this array.
You are not to modify this array -- it is there to help you decide how to move the octopus.

**Note that your job is not to modify the behavior of the Octopus apart from its movement.**
That is, the Octopus's eating and tentacle-grabbing behavior is fixed and you should not
attempt to change that; all you are trying to do is move the Octopus in the optimal fashion
to maximize your score.

### The `Fish` class

The `Fish` class represents a fish to eat, and has the following properties. You are not
to modify any of these properties in your code, but you are free to read them.
  + `fish.x` and `fish.y` are the fish's current coordinates.
  + `fish.value` is the number of points the fish is worth, if consumed.
  + `fish.health` is the fish's current health. If this reaches 0, the fish is eaten and the
  octopus gets `fish.value` points added to its score.
  + `fish.speed` is the fish's speed. Each time step, the fish will move up to `fish.speed`
  units.
  + `fish.fright` is the probability that a fish will try to swim away from the octopus on any
    time step that it is being grabbed by a tentacle. As you might imagine, the tastiest
    and highest-value fish tend to be the most skittish and will swim away more often!

# Scoring

Your score is based on the number of points you get by running the game for 1, 000, 000 steps.
You can run: `node ./dist/octofarm.js farm` which will run the game and show you the final score.
The default random-walk implementation of `MyOctopus` gets a score of around 1000 points, so
we're hoping you can do significantly better than that by being smart about moving the octopus!

Good luck!
