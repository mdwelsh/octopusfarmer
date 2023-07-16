#!/usr/bin/env node

import { program } from 'commander';
import { Client } from './client.js';
import { GameData, OctopusPosition } from 'octofarm-types';

function dumbOctopus(game: GameData): OctopusPosition {
	const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	const y = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	return { x: x, y: y } as OctopusPosition;
}

program
	.name('example')
	.version('0.0.1')
	.description('An example client for the Octopus Farmer game.')
	.option('-u, --url <string>', 'URL of the Octopus Farmer server', 'https://octopusfarmer.com')
	.option('-s, --steps <int>', 'Total number of steps to run', '1000');

program.command('run [gameId]').action(async (gameId?: string) => {
	const client = await Client.Create(program.opts().url, gameId);
	client.run(dumbOctopus, parseInt(program.opts().steps));
});

program.command('status <gameId>').action(async (gameId: string) => {
	const client = await Client.Create(program.opts().url, gameId);
	const game = await client.fetchGame();
	console.log(game);
});

program.parse(process.argv);
