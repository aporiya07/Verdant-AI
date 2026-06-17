import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdant AI — Know Your Carbon. Change Your World.",
  description:
    "AI-powered sustainability platform that helps you understand, track, and reduce your carbon footprint through personalized insights and Gemini-powered coaching.",
  keywords: ["carbon footprint", "sustainability", "AI", "Gemini", "climate"],
  openGraph: {
    title: "Verdant AI",
    description: "Know your carbon. Change your world.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="relative min-h-screen antialiased">{children}</body>
    </html>
  );
}
