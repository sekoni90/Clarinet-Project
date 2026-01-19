"use client";

import { GamesList } from "@/components/games-list";
import { getAllGames, type Game } from "@/lib/contract";
import { useEffect, useState } from "react";
import { GamesListSkeleton } from "@/components/loading-skeleton";
import { cache } from "@/lib/cache";
import Link from "next/link";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchGames() {
      try {
        console.log("[Home] Starting to fetch games...");
        setLoading(true);
        setError(null);
        
        const fetchedGames = await getAllGames();
        console.log("[Home] Fetched games:", fetchedGames);
        
        if (mounted) {
          setGames(fetchedGames);
          setLoading(false);
        }
      } catch (err) {
        console.error("[Home] Error fetching games:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load games");
          setLoading(false);
        }
      }
    }

    // Clear cache and fetch on mount
    console.log("[Home] Component mounted, clearing cache");
    cache.clear();
    fetchGames();

    return () => {
      console.log("[Home] Component unmounting");
      mounted = false;
    };
  }, []);

  const handleRefresh = () => {
    console.log("[Home] Manual refresh triggered");
    cache.clear();
    setLoading(true);
    setError(null);
    getAllGames().then(setGames).catch(err => {
      console.error("[Home] Refresh error:", err);
      setError(err instanceof Error ? err.message : "Failed to load games");
    }).finally(() => setLoading(false));
  };

  console.log("[Home] Render - loading:", loading, "error:", error, "games:", games.length);

  return (
    <section className="flex flex-col items-center py-20 min-h-screen w-full">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Tic Tac Toe 🎲</h1>
        <p className="text-sm text-gray-500 mt-2">
          Play 1v1 Tic Tac Toe on the Stacks blockchain
        </p>
      </div>

      {loading ? (
        <>
          <p className="text-gray-400 mb-4">Loading games...</p>
          <GamesListSkeleton />
        </>
      ) : error ? (
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <p className="font-semibold">Error loading games</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            type="button"
            onClick={handleRefresh} 
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-4xl flex justify-between items-center mb-4">
            <Link
              href="/create"
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              + Create New Game
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
              title="Refresh games list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <GamesList games={games} />
        </div>
      )}
    </section>
  );
}