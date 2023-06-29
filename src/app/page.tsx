/* Octopus Farmer */

"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

function OctopusFarmer() {
	const [games, setGames] = useState([]);

	useEffect(() => {
		async function fetchGames() {
			const res = await fetch("/api/games", {
				method: "GET",
			}).catch((err) => {
				throw err;
			});
			const data = await res.json();
			setGames(data);
		}
		fetchGames();
	}, []);

	return (
		<div style={{ width: "600px" }}>
			{games.map((game, i) => (
				<div key={i}>
					<div>{game.userId} / {game.gameId}</div>
				</div>
			))}
		</div>
	);
}

export default function Home() {
	return (
		<main className={styles.main}>
			<div>
				<h2>OctopusFarmer</h2>
			</div>
			<div>
				<OctopusFarmer />
			</div>
		</main>
	);
}
