import { createNewGame, joinGame, Move, play } from "@/lib/contract";
import { getStxBalance } from "@/lib/stx-utils";
import { config } from "@/lib/config";
import {
  openContractCall,
  showConnect,
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState } from "react";

const appDetails = {
  name: config.appName,
  icon: config.appIcon,
};

type UserSession = {
  userData: {
    identityAddress: string;
    decentralizedID: string;
    addresses?: {
      testnet: string;
      mainnet: string;
    };
  };
};

export function useStacks() {
  const [userData, setUserData] = useState<UserSession["userData"] | null>(null);
  const [stxBalance, setStxBalance] = useState(0);

  function connectWallet() {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
    });
  }

  function disconnectWallet() {
    // Clear user data from localStorage
    localStorage.removeItem("blockstack-session");
    setUserData(null);
    window.location.reload();
  }

  async function handleCreateGame(
    betAmount: number,
    moveIndex: number,
    move: Move
  ) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }
    if (betAmount === 0) {
      window.alert("Please make a bet");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await createNewGame(betAmount, moveIndex, move);
      openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          window.alert("Sent create game transaction");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
    }
  }

  async function handleJoinGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await joinGame(gameId, moveIndex, move);
      openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          window.alert("Sent join game transaction");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
    }
  }

  async function handlePlayGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await play(gameId, moveIndex, move);
      openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          window.alert("Sent play game transaction");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
    }
  }

  useEffect(() => {
    // Check if user is already connected
    const storedUserData = localStorage.getItem("blockstack-session");
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        if (parsed.userData) {
          setUserData(parsed.userData);
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userData?.addresses?.testnet) {
      const address = userData.addresses.testnet;
      getStxBalance(address).then((balance) => {
        setStxBalance(balance);
      });
    }
  }, [userData]);

  return {
    userData,
    stxBalance,
    connectWallet,
    disconnectWallet,
    handleCreateGame,
    handleJoinGame,
    handlePlayGame,
  };
}