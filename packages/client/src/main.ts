#!/usr/bin/env node

/**
 * This is a simple CLI for the Octopus Farmer game.
 */

import { program } from 'commander';
import { Client } from './client.js';
import { GameMetadata, NewGameRequest } from './types.js';
import { DumbOctopus } from './octopus.js';

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
	.action(async (gameId?: string, opts?) => {
		const newGameRequest: NewGameRequest = {
			owner: opts.owner,
			seed: opts.seed,
			gameType: opts.type,
		};
		const client = await Client.Create(program.opts().url, gameId, newGameRequest);
		client.run(DumbOctopus, parseInt(opts.steps));
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
