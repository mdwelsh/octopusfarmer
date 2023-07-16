'use client';

import Link from 'next/link';

export default function NavBar() {
	return (
		<div className="flex flex-row justify-between items-center border-slate-500 border-b-2 pl-6 pt-4 pb-4">
			<div className="flex flex-row items-center">
				<Link href="/">
					<p className="font-mono">🐙🌾 Octopus Farmer</p>
				</Link>
			</div>
			<div className="font-mono flex flex-row pr-8 underline">
				<a href="https://github.com/mdwelsh/octopusfarmer">GitHub</a>
			</div>
		</div>
	);
}
