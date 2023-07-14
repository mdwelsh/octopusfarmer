#!/usr/bin/env node

import { program } from 'commander';
import { Client } from './client.js';

program
	.name('example')
	.version('0.0.1')
	.description('A game about farming octopuses.')
	.option('-s, --steps <int>', 'Total number of steps to run', '100')
	.option('-u, --url <string>', 'URL of the Octopus Farm server', 'http://localhost:3000');

program.command('run').action(() => {
	console.log('You did the run command');
});

program.command('farm').action(() => {
	console.log('You did the farm command');
});

program.parse(process.argv);

function run() {
	const client = Client.Create(program.url);
}