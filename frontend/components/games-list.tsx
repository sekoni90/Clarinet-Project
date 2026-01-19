"use client";

import { Game } from "@/lib/contract";
import Link from "next/link";
import { GameBoard } from "./game-board";
import { useStacks } from "@/hooks/use-stacks";
import { useMemo } from "react";
import { formatStx } from "@/lib/stx-utils";

export function GamesList({ games }: { games: Game[] }) {
  const { userData } = useStacks();

  console.log("[GamesList] Rendering with", games.length, "games, userData:", !!userData);

  // User Games are games in which the user is a player
  // and a winner has not been decided yet
  const userGames = useMemo(() => {
    if (!userData) return [];
    const userAddress = userData.addresses?.testnet || userData.identityAddress;
    const filteredGames = games.filter(
      (game) =>
        (game["player-one"] === userAddress ||
          game["player-two"] === userAddress) &&
        game.winner === null
    );
    console.log("[GamesList] User games:", filteredGames.length);
    return filteredGames;
  }, [userData, games]);

  // Joinable games are games in which there still isn't a second player
  // and also the currently logged in user is not the creator of the game
  const joinableGames = useMemo(() => {
    if (!userData) {
      // If no user, show all games that need a second player
      const filtered = games.filter(
        (game) => game.winner === null && game["player-two"] === null
      );
      console.log("[GamesList] Joinable games (no user):", filtered.length);
      return filtered;
    }
    const userAddress = userData.addresses?.testnet || userData.identityAddress;
    const filtered = games.filter(
      (game) =>
        game.winner === null &&
        game["player-one"] !== userAddress &&
        game["player-two"] === null
    );
    console.log("[GamesList] Joinable games (with user):", filtered.length);
    return filtered;
  }, [games, userData]);

  // Ended games are games in which the winner has been decided
  const endedGames = useMemo(() => {
    const filtered = games.filter((game) => game.winner !== null);
    console.log("[GamesList] Ended games:", filtered.length);
    return filtered;
  }, [games]);

  return (
    <div className="w-full max-w-4xl space-y-12">
      {userData && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Games</h2>
          {userGames.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500 mb-4">
                You haven&apos;t joined any games yet
              </p>
              <Link
                href="/create"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create New Game
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-8 max-w-7xl overflow-x-auto">
              {userGames.map((game) => (
                <Link
                  key={`your-game-${game.id}`}
                  href={`/game/${game.id}`}
                  className="shrink-0 flex flex-col gap-2 border p-4 rounded-md border-gray-700 bg-gray-900 w-fit"
                >
                  <GameBoard
                    board={game.board}
                    cellClassName="size-8 text-xl"
                  />
                  <div className="text-md px-1 py-0.5 bg-gray-800 rounded text-center w-full">
                    {formatStx(game["bet-amount"])} STX
                  </div>
                  <div className="text-md px-1 py-0.5 bg-gray-800 rounded text-center w-full">
                    Next Turn: {game["is-player-one-turn"] ? "X" : "O"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">
          {userData ? "Joinable Games" : "All Games"}
        </h2>
        {joinableGames.length === 0 && games.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-500 mb-4">
              No games found. Be the first to create one!
            </p>
            <Link
              href="/create"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create New Game
            </Link>
          </div>
        ) : joinableGames.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-500 mb-4">
              No joinable games available right now.
            </p>
            <Link
              href="/create"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create New Game
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-8 max-w-7xl overflow-x-auto pb-4">
            {joinableGames.map((game) => (
              <Link
                key={`joinable-game-${game.id}`}
                href={`/game/${game.id}`}
                className="shrink-0 flex flex-col gap-2 border p-4 rounded-md border-gray-700 bg-gray-900 w-fit hover:border-gray-500 transition-colors"
              >
                <GameBoard
                  board={game.board}
                  cellClassName="size-8 text-xl"
                />
                <div className="text-md px-1 py-0.5 bg-gray-800 rounded text-center w-full">
                  {formatStx(game["bet-amount"])} STX
                </div>
                <div className="text-md px-1 py-0.5 bg-gray-800 rounded text-center w-full">
                  Next Turn: {game["is-player-one-turn"] ? "X" : "O"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {endedGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Ended Games</h2>
          <div className="flex items-center gap-8 max-w-7xl overflow-x-auto pb-4">
            {endedGames.map((game) => (
              <Link
                key={`ended-game-${game.id}`}
                href={`/game/${game.id}`}
                className="shrink-0 flex flex-col gap-2 border p-4 rounded-md border-gray-700 bg-gray-900 w-fit opacity-75 hover:opacity-100 transition-opacity"
              >
                <GameBoard
                  board={game.board}
                  cellClassName="size-8 text-xl"
                />
                <div className="text-md px-1 py-0.5 bg-gray-800 rounded text-center w-full">
                  {formatStx(game["bet-amount"])} STX
                </div>
                <div className="text-md px-1 py-0.5 bg-green-800 rounded text-center w-full">
                  Winner: {game["is-player-one-turn"] ? "O" : "X"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}