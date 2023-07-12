import { useEffect, useRef } from 'react';

import { WorldData, TentacleData } from '@/lib/World';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const SHOW_GRID = false;

function drawWorld(ctx: CanvasRenderingContext2D, world?: WorldData) {
	if (!world) {
		return;
	}
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	const tileWidth = CANVAS_WIDTH / world.width;
	const tileHeight = CANVAS_HEIGHT / world.height;
	ctx.lineWidth = 1;
	// Draw a grid.
	if (SHOW_GRID) {
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 1;
		for (let x = 0; x < world.width; x++) {
			ctx.beginPath();
			ctx.moveTo(x * tileWidth, 0);
			ctx.lineTo(x * tileWidth, CANVAS_HEIGHT);
			ctx.stroke();
		}
		for (let y = 0; y < world.height; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * tileHeight);
			ctx.lineTo(CANVAS_WIDTH, y * tileHeight);
			ctx.stroke();
		}
	}
	// Draw the octopus.
	ctx.fillStyle = '#5050ff';
	ctx.fillRect(world.octopus.x * tileWidth, world.octopus.y * tileHeight, tileWidth, tileHeight);
	// Draw all fish.
	for (const fishGroup of world.fishGroups) {
		for (const fish of fishGroup.fishes) {
			// If the fish is in the octopus.tentacles, draw it red.
			if (world.octopus.tentacles.some((tentacle: TentacleData) => tentacle && tentacle.fishId === fish.id)) {
				ctx.fillStyle = '#ff5050';
			} else {
				ctx.fillStyle = '#50ff50';
			}
			ctx.fillRect(fish.x * tileWidth, fish.y * tileHeight, tileWidth, tileHeight);
		}
	}
}

export function WorldView({ world }: { world: WorldData }) {
	const canvasRef = useRef();

	useEffect(() => {
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			drawWorld(ctx, world);
		}
	}, [world]);

	return (
		<div>
			<canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ border: '2px solid #505050' }} />
		</div>
	);
}
