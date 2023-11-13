import { useEffect, useRef } from 'react';

import { WorldData, TentacleData } from '@mdwelsh/octofarm';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
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
	// Draw traps first.
	if ('traps' in world) {
		for (const trap of world.traps) {
			ctx.beginPath();
			ctx.arc(trap.x * tileWidth, trap.y * tileHeight, trap.radius * tileWidth, 0, 2 * Math.PI, false);
			ctx.fillStyle = '#602020';
			ctx.fill();
		}
	}
	// Draw the octopus.
	ctx.font = '10px sans-serif';
	ctx.fillStyle = '#5050ff';
	ctx.fillText('🐙', world.octopus.x * tileWidth, world.octopus.y * tileHeight);
	if (!world.octopus.alive) {
		ctx.fillText('❌', world.octopus.x * tileWidth, world.octopus.y * tileHeight);
	}
	// Draw all fish.
	for (const fish of world.fish) {
		// If the fish is in the octopus.tentacles, draw it red.
		if (world.octopus.tentacles.some((tentacle: TentacleData) => tentacle && tentacle.fishId === fish.id)) {
			ctx.fillText('🎣', fish.x * tileWidth, fish.y * tileHeight);
		} else {
			const fishGlyphs = [ '🐟', '🐠', '🦈', '🐡', '🐋', '🐳', '🦐', '🐬', '🦞' ]
			// Pick the glyph based on fish.value.
			const glyph = fishGlyphs[fish.value % fishGlyphs.length];
			ctx.fillText(glyph, fish.x * tileWidth, fish.y * tileHeight);
		}
	}
}

export function WorldView({ world }: { world: WorldData }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (!ctx) {
				return;
			}
			drawWorld(ctx, world);
		}
	}, [world]);

	return (
		<div>
			<canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ border: '2px solid #505050' }} />
		</div>
	);
}
