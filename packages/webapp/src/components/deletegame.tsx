import React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DeleteGameDialog({ gameId, children }: { gameId: string; children: React.ReactNode }) {
	const doDelete = async () => {
		const res = await fetch(`/api/game/${gameId}`, {
			method: 'DELETE',
		});
		if (!res.ok) {
			return;
		}
		const data = await res.json();
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete game {gameId} ?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete this game.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={doDelete}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
