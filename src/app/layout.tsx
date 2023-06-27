import './globals.css';

export const metadata = {
  title: 'Octopus Farmer',
  description: 'A game about octopuses farming.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
