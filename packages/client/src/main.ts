#!/usr/bin/env node

/**
 * This is a simple example client application for the Octopus Farmer game.
 * You're welcome to use this as the basis for your own submission, but there
 * is no requirement to do so.
 */

import { program } from 'commander';
import open from 'open';
import { Client } from './client.js';
import { GameData, OctopusPosition, GameMetadata, NewGameRequest } from '@mdwelsh/octofarm-types';

/**
 * This is a very basic implementation of the octopus, which moves randomly.
 * You'll want to replace this with your own, much better, implementation.
 */
function dumbOctopus(game: GameData): OctopusPosition {
	const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	const y = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	return { x, y } as OctopusPosition;
}

program
	.name('octofarm')
	.version('0.0.1')
	.description('An example client for the Octopus Farmer game.')
	.option('-u, --url <string>', 'URL of the Octopus Farmer server', 'https://octopusfarmer.com');

/* The `run` command is used to run a game. */
program
	.command('run [gameId]')
	.option('--owner <string>', 'Email address of game owner')
	.option('--type <string>', 'Game type', 'normal')
	.option('--seed <int>', 'Seed for game PRNG')
	.option('--steps <int>', 'Total number of steps to run', '1000')
	.option('--view', 'Open a browser window to view the game')
	.action(async (gameId?: string, opts?) => {
		const newGameRequest: NewGameRequest = {
			owner: opts.owner,
			seed: opts.seed,
			gameType: opts.type,
		};
		const client = await Client.Create(program.opts().url, gameId, newGameRequest);
		if (program.opts().view) {
			open(client.previewUrl());
		}
		client.run(dumbOctopus, parseInt(opts.steps));
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

/* The `leaderboard` command reads the leaderboard. */
program.command('leaderboard').action(async () => {
	const res = await fetch(`${program.opts().url}/api/games`, {
		method: 'GET',
	});
	if (!res.ok) {
		throw new Error(`Unable to fetch leaderboard: ${res}`);
	}
	const leaderboard = (await res.json()) as Promise<GameMetadata[]>;
	console.log(leaderboard);
});

program.parse(process.argv);
