'use client';

import Link from 'next/link';
import Image from 'next/image';


export default function NavBar() {
	return (
		<div className="flex flex-row justify-between items-center border-slate-500 border-b-2 pl-6 pt-4 pb-4">
			<div className="flex flex-row items-center">
				<Link href="/">
					<Image src="/icon.png" alt="Octopus Farmer" width={100} height={100} />
				</Link>
			</div>
			<div className="font-mono flex flex-row pr-8 underline">
				<a href="https://github.com/mdwelsh/octopusfarmer">GitHub</a>
			</div>
		</div>
	);
}
