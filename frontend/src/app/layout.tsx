import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verdant AI — Your Personal Sustainability Coach',
  description:
    'Track your carbon footprint, get AI-powered sustainability insights, and turn everyday choices into climate impact with Verdant AI.',
  keywords: ['sustainability', 'carbon footprint', 'AI coach', 'climate', 'green living'],
  openGraph: {
    title: 'Verdant AI',
    description: 'Turn Everyday Choices Into Climate Impact.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
