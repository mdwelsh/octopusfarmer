/**
 * This module implements a basic UI to the Octopus Farmer game
 * that only shows the current score, moves, and other key variables.
 */

import { Box, Spacer, Text } from 'ink';
import React, { useEffect, useState } from 'react';
import { Octopus } from './octopus.js';

import { World } from "./world.js";

export default function Farm({ width, height, steps, updateInterval }: { width: number, height: number, steps: number, updateInterval: number }) {

	const [world, setWorld] = useState(new World(width, height));
	const [moves, setMoves] = useState(0);
	const [score, setScore] = useState(0);
	const [reach, setReach] = useState(0);
	const [attack, setAttack] = useState(0);
	const [tentacles, setTentacles] = useState(0);

	useEffect(() => {
		console.log("Starting game with width: " + width + " height: " + height + " steps: " + steps + " updateInterval: " + updateInterval);
		const timer = setInterval(() => {
			for (let i = 0; i < updateInterval; i++) {
				world.update();
			}
			setMoves(world.moves);
			setScore(world.score);
			let octopus = world.predator as Octopus;
			setReach(octopus.reach);
			setAttack(octopus.attack_power);
			setTentacles(octopus.num_tentacles);
			if (world.moves >= steps) {
				process.exit();
			}
		}, 0);
		return () => {
			clearInterval(timer);
		};
	}, []);

	return (
		<Box borderStyle="round" borderColor="green" paddingLeft={1} height={3} width={width} >
			<Text>🐙 Octopus Farmer!</Text>
			<Spacer />
			<Text>Moves: {moves}</Text>
			<Spacer />
			<Text>Score: {score}</Text>
			<Spacer />
			<Text>Reach: {reach}</Text>
			<Spacer />
			<Text>Attack: {attack}</Text>
			<Spacer />
			<Text>Tentacles: {tentacles}</Text>
		</Box>
	);
}

