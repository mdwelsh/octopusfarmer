'use client';
import styles from '../../../page.module.css';
import stringHash from 'string-hash';
import { useState, useEffect } from 'react';
import React from 'react';
import { GameData } from 'octofarm-types';
import { WorldView } from '@/components/worldview';
import { Trash } from '@phosphor-icons/react';
import DeleteGameDialog from '@/components/deletegame';
import { Button } from '@/components/ui/button';

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
					<div className="font-mono font-sm pt-6">Hash: {stringHash(params.game).toString(16)}</div>
					<div className="font-mono font-sm pt-6">Moves: {game!.world.moves}</div>
					<div className="font-mono font-sm">Score: {game!.world.score}</div>
					<div className="pt-6">
						<DeleteGameDialog gameId={game.gameId}>
							<Button className="rounded-full border-2 border-red-700 bg-black text-white hover:bg-slate-600">
							<Trash size={20} className="text-red-500" />
							</Button>
						</DeleteGameDialog>
					</div>
				</div>
				<div className="flex flex-row gap-4 p-4 justify-center">
					<WorldView world={game.world} />
				</div>
			</div>
		)
	);
}
