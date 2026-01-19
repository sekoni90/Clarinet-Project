import { STACKS_TESTNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ListCV,
  OptionalCV,
  PrincipalCV,
  TupleCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";
import { cache } from "./cache";
import { config } from "./config";

const CONTRACT_ADDRESS = config.contractAddress;
const CONTRACT_NAME = config.contractName;

type GameCV = {
  "player-one": PrincipalCV;
  "player-two": OptionalCV<PrincipalCV>;
  "is-player-one-turn": BooleanCV;
  "bet-amount": UIntCV;
  board: ListCV<UIntCV>;
  winner: OptionalCV<PrincipalCV>;
};

export type Game = {
  id: number;
  "player-one": string;
  "player-two": string | null;
  "is-player-one-turn": boolean;
  "bet-amount": number;
  board: number[];
  winner: string | null;
};

export enum Move {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export const EMPTY_BOARD = [
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
];
export async function getAllGames(): Promise<Game[]> {
  try {
    // Check cache first
    const cachedGames = cache.get<Game[]>('all-games');
    if (cachedGames !== undefined) {
      console.log('Returning cached games:', cachedGames.length);
      return cachedGames;
    }

    console.log('Fetching games from API...');
    // Fetch the latest-game-id from the contract
    const latestGameIdCV = (await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-latest-game-id",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    })) as UIntCV;

    // Convert the uintCV to a JS/TS number type
    const latestGameId = parseInt(latestGameIdCV.value.toString());
    console.log('Latest game ID:', latestGameId);

    // Fetch all games in parallel with batching to avoid rate limits
    const games: Game[] = [];
    const batchSize = 3; // Process 3 games at a time
    
    for (let i = 0; i < latestGameId; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, latestGameId); j++) {
        batch.push(getGame(j));
      }
      
      const results = await Promise.allSettled(batch);
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          games.push(result.value);
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < latestGameId) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    
    console.log('Fetched games:', games.length);
    // Cache the results for 30 seconds
    cache.set('all-games', games, 30000);
    return games;
  } catch (error) {
    console.error("Failed to fetch games:", error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function getGame(gameId: number): Promise<Game | null> {
  try {
    // Check cache first
    const cacheKey = `game-${gameId}`;
    const cachedGame = cache.get<Game | null>(cacheKey);
    if (cachedGame !== undefined) {
      return cachedGame;
    }

    // Use the get-game read only function to fetch the game details for the given gameId
    const gameDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-game",
      functionArgs: [uintCV(gameId)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    const responseCV = gameDetails as OptionalCV<TupleCV<GameCV>>;
    // If we get back a none, then the game does not exist and we return null
    if (responseCV.type === "none") {
      cache.set(cacheKey, null, 30000);
      return null;
    }
    // If we get back a value that is not a tuple, something went wrong and we return null
    if (responseCV.value.type !== "tuple") {
      cache.set(cacheKey, null, 30000);
      return null;
    }

    // If we got back a GameCV tuple, we can convert it to a Game object
    const gameCV = responseCV.value.value;

    const game: Game = {
      id: gameId,
      "player-one": gameCV["player-one"].value,
      "player-two":
        gameCV["player-two"].type === "some"
          ? gameCV["player-two"].value.value
          : null,
      "is-player-one-turn": cvToValue(gameCV["is-player-one-turn"]),
      "bet-amount": parseInt(gameCV["bet-amount"].value.toString()),
      board: gameCV["board"].value.map((cell) =>
        parseInt(cell.value.toString())
      ),
      winner:
        gameCV["winner"].type === "some" ? gameCV["winner"].value.value : null,
    };
    
    // Cache individual game for 30 seconds
    cache.set(cacheKey, game, 30000);
    return game;
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error;
  }
}

export async function createNewGame(
  betAmount: number,
  moveIndex: number,
  move: Move
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-game",
    functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function joinGame(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "join-game",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function play(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "play",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}
