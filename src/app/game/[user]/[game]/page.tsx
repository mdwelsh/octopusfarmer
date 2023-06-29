"use client";
import styles from "../../../page.module.css";
import { useState, useEffect } from "react";
import { WorldView } from "@/components/worldview";

type RouteSegment = { params: { user: string; game: string } };

export default function GameDetail({ params }: RouteSegment) {
	const [game, setGame] = useState({});

	useEffect(() => {
		async function fetchGame() {
			const res = await fetch(`/api/game/${params.user}/${params.game}`, {
				method: "GET",
			}).catch((err) => {
				throw err;
			});
			const data = await res.json();
			setGame(data);
		}
		fetchGame();
	}, []);

	const step = async () => {
		const res = await fetch(`/api/game/${params.user}/${params.game}`, {
			method: "POST",
		}).catch((err) => {
			throw err;
		});
		const data = await res.json();
		setGame(data);
	};

	return (
		<main className={styles.main}>
			<div>
				<div>
					Viewing game {params.user} / {params.game}
				</div>
				<div>
					<Button onClick={step}>Step</Button>
				</div>
			</div>
			<WorldView world={game.world} />
		</main>
	);
}
