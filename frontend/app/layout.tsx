import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "Tic Tac Toe - Play on Stacks Blockchain",
  description:
    "Play 1v1 Tic Tac Toe on the Stacks blockchain. Create games, place bets, and compete with other players in a decentralized gaming experience.",
  keywords: [
    "tic tac toe",
    "blockchain game",
    "stacks",
    "web3",
    "decentralized",
  ],
  authors: [{ name: "Stacks Developer" }],
  openGraph: {
    title: "Tic Tac Toe - Play on Stacks Blockchain",
    description: "Play 1v1 Tic Tac Toe on the Stacks blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Navbar />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}