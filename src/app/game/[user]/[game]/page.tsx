"use client";
import styles from "../../../page.module.css";
import { React, useState, useEffect } from "react";
import { WorldView } from "@/components/worldview";
import { Button } from "@/components/ui/button";
import { Play, PlayPause, Pause } from "@phosphor-icons/react";

function GameControlButton({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<Button
			className="rounded-full border-2 border-red-700 bg-black text-white hover:bg-slate-600"
			onClick={onClick}
		>
			{children}
		</Button>
	);
}

function GameControls({
	playing,
	onPlay,
	onStep,
}: {
	playing: boolean;
	onPlay: () => void;
	onPause: () => void;
}) {
	return (
		<div className="flex flex-row justify-start gap-4">
			<GameControlButton onClick={onPlay}>
				{playing ? <Pause size={16} /> : <Play size={16} />}
			</GameControlButton>
			<GameControlButton onClick={onStep}>
				<PlayPause size={16} />
			</GameControlButton>
		</div>
	);
}

type RouteSegment = { params: { user: string; game: string } };

export default function GameDetail({ params }: RouteSegment) {
	const [game, setGame] = useState(null);
	const [playing, setPlaying] = useState(false);
	const [deltaX, setDeltaX] = useState(0);
	const [deltaY, setDeltaY] = useState(0);
	const [moved, setMoved] = useState(false);
	const [moves, setMoves] = useState(-1);

	useEffect(() => {
		// Fetch game if we have not already done so.
		if (!game) {
			fetchGame();
		}
	});

	useEffect(() => {
		// Check to see if we need to move the octopus.
		const doMove = async () => {
			console.log(`USEEFFECT MOVING: ${deltaX}, ${deltaY} - moves is ${moves}, game.moves is ${game?.world?.moves}`);
			await moveTo(deltaX, deltaY);
			await setMoved(false);
			await setDeltaX(0);
			await setDeltaY(0);
			console.log(`USEEFFECT DONE MOVING: ${deltaX}, ${deltaY} - moves is ${moves}, game.moves is ${game?.world?.moves}`);
		};
		if (moved || playing) {
			doMove();
		}
	}, [moved, playing, moves]);

	const fetchGame = async () => {
		const res = await fetch(`/api/game/${params.user}/${params.game}`, {
			method: "GET",
		});
		if (!res.ok) {
			return;
		}
		const data = await res.json();
		setGame(data);
		setMoves(data.world.moves);
	};

	// XXX XXX XXX XXX MDW STOPPED HERE
	// I've decided that without transaction support in the Upstash Redis API, there's not going
	// to be a good way of preventing multiple concurrent updates to the world state from colliding
	// on the server. I could hack around this but it does not seem like a good use of time, nor
	// would it be all that reliable.
	// 
	// Instead, I realize that the ability to update the world and move the octopus from the web
	// is a bit silly and was only intended for fun. So, I am going to rip all this out and only
	// have the website be a read-only view into the game state, but require the user to run their
	// own client to do any updates. Even "step" will not work here as that is a mutating operation.

	const moveTo = async (x: number, y: number) => {
		console.log(`MOVETO: moves=${moves} game.moves=${game.world.moves} x=${x} y=${y} deltax=${deltaX} deltay=${deltaY}`);
		if (!game) {
			return;
		}
		// Move the octopus to the given position.
		const res = await fetch(`/api/game/${params.user}/${params.game}`, {
			method: "POST",
			body: JSON.stringify({
				// We pass in the current 'moves' as a Lamport clock to avoid multiple
				// concurrent updates to the world from taking place at the same time.
				moves: game.world.moves,
				octopus: {
					x: game.world.octopus.x + deltaX,
					y: game.world.octopus.y + deltaY,
				},
			})
		});
		if (!res.ok) {
			console.log("Got error performing POST in moveTo: ", await res.json());
			return;
		}
		const data = await res.json();
		console.log(`MOVETO DONE: moves=${moves} game.moves=${data.world.moves} x=${x} y=${y} deltax=${deltaX} deltay=${deltaY}`);
		setGame(data);
		setMoves(data.world.moves);
	};

	const step = async () => {
		setMoved(true);
		setDeltaX(0);
		setDeltaY(0);
	};

	const play = () => {
		setPlaying(!playing);
	};

	const keyDownEvent = async (event: React.KeyboardEvent<HTMLDivElement>) => {
		console.log("KEYDOWN: ", event.code);
		const speed = game?.world?.octopus?.speed || 1;
		if (event.code === "ArrowRight") {
			setDeltaX(speed);
		}
		if (event.code === "ArrowLeft") {
			setDeltaX(-speed);
		}
		if (event.code === "ArrowDown") {
			setDeltaY(speed);
		}
		if (event.code === "ArrowUp") {
			setDeltaY(-speed);
		}
		setMoved(true);
	};

	return (
		<div className="flex flex-row gap-4 justify-start" onKeyDown={keyDownEvent} tabIndex="0">
			<div className="w-160 flex flex-col gap-1 p-4 justify-start">
				<div className="font-mono font-sm">Viewing game:</div>
				<div className="font-mono font-sm">
					{params.user}/{params.game}
				</div>
				<div className="font-mono font-sm pt-6">
					Moves: {game?.world?.moves}
				</div>
				<div className="font-mono font-sm pt-6">
					Delta: {deltaX}, {deltaY}
				</div>
				<div className="font-mono font-sm">Score: {game?.world?.score}</div>
				<div className="pt-4">
					<GameControls playing={playing} onPlay={play} onStep={step} />
				</div>
			</div>
			<div className="flex flex-row gap-4 p-4 justify-center">
				{game && <WorldView world={game.world} />}
			</div>
		</div>
	);
}
