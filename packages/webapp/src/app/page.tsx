/* Octopus Farmer */

'use client';
import styles from './page.module.css';
import { GameMetadata } from 'octofarm-types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// @ts-expect-error
import { humanize } from 'humanize';

function About() {
	return (
		<div className="w-3/5 font-mono text-sm text-slate-400">
			Octopus Farmer is a game in which you control an octopus that roams around a world, catching fish with its
			tentacles. The game is played by writing a program that controls the octopus via a REST API. See{' '}
			<span className="underline">
				<a href="https://github.com/mdwelsh/octopusfarmer">the GitHub page</a>
			</span>{' '}
			for more details and documentation.
		</div>
	);
}

function GameList() {
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchGames() {
			const res = await fetch('/api/games', {
				method: 'GET',
			});
			if (!res.ok) {
				console.log('Error fetching game list: ', res);
				setGames([]);
				return;
			}
			const data = await res.json();
			setGames(data);
			setLoading(false);
		}
		fetchGames();
	}, [games]);

	return (
		<div className="flex flex-col w-full gap-2 pt-4">
			{loading ? (
				<div>Loading...</div>
			) : (
				<div>
					<div>Leaderboard <span className="text-slate-400">(only top 10 games shown)</span></div>
					{games.map((game: GameMetadata, i: number) => (
						<div className="flex flex-row gap-4 pt-4" key={i}>
							hash: {game.hash} {game.gameType && `type: ${game.gameType}`} score: {game.score} moves: {game.moves}{' '}
							created: {humanize.relativeTime(new Date(game.created).getTime() / 1000)} modified:{' '}
							{humanize.relativeTime(new Date(game.modified).getTime() / 1000)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default function Home() {
	return (
		<div className="flex flex-col font-mono p-8">
			<About />
			<GameList />
		</div>
	);
}
