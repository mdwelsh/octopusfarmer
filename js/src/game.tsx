import React from 'react';
import { Box, Spacer, Text, useInput } from 'ink';
import { useEffect, useState } from "react";
import { useStdout } from "ink";

import { Fish, Octopus, OctopusReach, World, WorldObject } from "./world.js";

const UPDATE_INTERVAL = 10;

export function useStdoutDimensions(): [number, number] {
	const { stdout } = useStdout();
	const [dimensions, setDimensions] = useState<[number, number]>([
		stdout.columns,
		stdout.rows,
	]);

	useEffect(() => {
		const handler = () => setDimensions([stdout.columns, stdout.rows]);
		stdout.on("resize", handler);
		return () => {
			stdout.off("resize", handler);
		};
	}, [stdout]);

	return dimensions;
}

function Title({ width, moves, score, reach, power, tentacles }: { width: number, moves: number, score: number, reach: number, power: number, tentacles: number }) {
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
			<Text>Attack: {power}</Text>
			<Spacer />
			<Text>Tentacles: {tentacles}</Text>
		</Box>
	);
}

function GameBoardRow({ columns, row, world }: { columns: number; row: number, world: WorldObject[] }) {

	const textElems: React.ReactElement[] = [];
	let x = 0;

	// Get objects on this row, sorted by x.
	let objs = world.filter((obj) => obj.y === row).sort((a, b) => a.x - b.x);
	for (let obj of objs) {
		if (obj.x > x) {
			// Add empty space.
			textElems.push(
				<Text>{" ".repeat(obj.x - x)}</Text>
			);
		}
		let bgColor = "black";
		let color = "blue";
		if (obj instanceof Fish) {
			const fish = obj as Fish;
			color = "blue";
			if (fish.underAttack()) {
				color = "red";
			}
		} else if (obj instanceof Octopus) {
			color = "green";
		} else if (obj instanceof OctopusReach) {
			bgColor = "red";
		}
		textElems.push(
			<Text bold backgroundColor={bgColor} color={color} dimColor>{obj.render()}</Text>
		);
		x = obj.x + 1;
	}
	if (x < columns) {
		// Add empty space.
		textElems.push(
			<Text>{" ".repeat(columns - x-1)}</Text>
		);
	}

	return (
		<Box flexDirection="row" width={columns}>{textElems}</Box>
	);
}


function GameBoard({ columns, rows, world }: { columns: number; rows: number, world: WorldObject[] }) {
	return (
		<Box borderStyle="round" borderColor="green" flexDirection="column" width={columns} height={rows}>
			{
				Array.from(Array(rows).keys()).map((row) => (
					<GameBoardRow key={row} columns={columns-2} row={row} world={world} />
				))
			}
		</Box>
	);
}

function StatusBar({ paused }: { paused: boolean }) {
	return (
		<Box padding={1} width="100%" height={1} >
			<Text>Arrow keys, wasd, or hjkl to move, q to quit. Space to pause.</Text>
			<Text color="yellow">{paused ? " [Paused] " : ""}</Text>
		</Box>
	);
}

export default function Game() {
	const [paused, setPaused] = useState(false);
	const [columns, rows] = useStdoutDimensions();
	const [world, setWorld] = useState(new World(columns - 10, rows - 10));
	const [moves, setMoves] = useState(0);
	const [score, setScore] = useState(0);
	const [reach, setReach] = useState(0);
	const [power, setPower] = useState(0);
	const [tentacles, setTentacles] = useState(0);
	const [worldObjects, setWorldObjects] = useState([] as WorldObject[]);

	useInput((input, key) => {
		if (input === " ") {
			setPaused(!paused);
		}
		if (input === "q") {
			process.exit();
		}
		if (key.leftArrow || input === "h" || input === "a") {
			world.octopus.moveLeft();
		}
		if (key.rightArrow || input === "l" || input === "d") {
			world.octopus.moveRight();
		}
		if (key.upArrow || input === "k" || input === "w") {
			world.octopus.moveUp();
		}
		if (key.downArrow || input === "j" || input === "s") {
			world.octopus.moveDown();
		}
	});

	useEffect(() => {
		let world = new World(columns - 10, rows - 10);
		setWorld(world);
		const timer = setInterval(() => {
			if (paused) {
				return;
			}
			world.update();
			setMoves(world.moves);
			setScore(world.score);
			setReach(world.octopus.reach);
			setPower(world.octopus.attack_power);
			setTentacles(world.octopus.num_tentacles);
			setWorldObjects(world.objects());
		}, UPDATE_INTERVAL);
		return () => {
			clearInterval(timer);
		};
	}, [paused]);

	return (
		<Box flexDirection="column" height={rows}>
			<Title width={columns-10} moves={moves} score={score} reach={reach} power={power} tentacles={tentacles} />
			<GameBoard columns={columns - 10} rows={rows - 7} world={worldObjects} />
			<StatusBar paused={paused} />
		</Box>
	);
}
