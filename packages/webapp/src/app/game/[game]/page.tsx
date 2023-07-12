'use client';
import styles from '../../../page.module.css';
import { useState, useEffect } from 'react';
import React from 'react';
import { GameData } from '@/lib/World';
import { WorldView } from '@/components/worldview';
import { Button } from '@/components/ui/button';
import { Play, PlayPause, Pause } from '@phosphor-icons/react';

type RouteSegment = { params: { game: string } };

export default function GameDetail({ params }: RouteSegment) {
	const [game, setGame] = useState<null | GameData>(null);

	const fetchGame = async () => {
		const res = await fetch(`/api/game/${params.game}`, {
			method: 'GET',
		});
		if (!res.ok) {
			return;
		}
		const data = await res.json();
		setGame(data);
	};

	useEffect(() => {
		fetchGame();
	});

	return (
		game && (
		<div className="flex flex-row gap-4 justify-start">
			<div className="w-160 flex flex-col gap-1 p-4 justify-start">
				<div className="font-mono font-sm">Viewing game:</div>
				<div className="font-mono font-sm">{params.game}</div>
				<div className="font-mono font-sm pt-6">Moves: {game!.world.moves}</div>
				<div className="font-mono font-sm">Score: {game!.world.score}</div>
			</div>
			<div className="flex flex-row gap-4 p-4 justify-center">
				<WorldView world={game.world} />
			</div>
		</div>
		)
	);
}
