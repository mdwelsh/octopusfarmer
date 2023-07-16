#!/usr/bin/env node

/**
 * This is a simple example client application for the Octopus Farmer game.
 * You're welcome to use this as the basis for your own submission, but there
 * is no requirement to do so.
 */

import { program } from 'commander';
import open from 'open';
import { Client } from './client.js';
import { GameData, OctopusPosition } from 'octofarm-types';

/**
 * This is a very basic implementation of the octopus, which moves randomly.
 * You'll want to replace this with your own, much better, implementation.
 */
function dumbOctopus(game: GameData): OctopusPosition {
	const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	const y = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	return { x: x, y: y } as OctopusPosition;
}

program
	.name('octofarm')
	.version('0.0.1')
	.description('An example client for the Octopus Farmer game.')
	.option('-u, --url <string>', 'URL of the Octopus Farmer server', 'https://octopusfarmer.com')
	.option('-s, --steps <int>', 'Total number of steps to run', '1000')
	.option('-v, --view', 'Open a browser window to view the game');

/* The `run` command is used to run a game. */
program.command('run [gameId]').action(async (gameId?: string) => {
	const client = await Client.Create(program.opts().url, gameId);
	if (program.opts().view) {
		open(client.previewUrl());
	}
	client.run(dumbOctopus, parseInt(program.opts().steps));
});

/* The `status` command reads the current state of a given game. */
program.command('status <gameId>').action(async (gameId: string) => {
	const client = await Client.Create(program.opts().url, gameId);
	if (program.opts().view) {
		open(client.previewUrl());
	}
	const game = await client.fetchGame();
	console.log(game);
});

program.parse(process.argv);
