import './globals.css';
import NavBar from '@/components/navbar';

export const metadata = {
	title: 'Octopus Farmer',
	description: 'A game about octopuses farming.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-[#030716] text-white">
				<NavBar />
				{children}
			</body>
		</html>
	);
}
