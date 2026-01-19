// Application configuration from environment variables
export const config = {
  network: process.env.NEXT_PUBLIC_NETWORK || "testnet",
  contractAddress:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN",
  contractName: process.env.NEXT_PUBLIC_CONTRACT_NAME || "tic-tac-toe",
  stacksApiUrl:
    process.env.NEXT_PUBLIC_STACKS_API_URL || "https://api.testnet.hiro.so",
  explorerUrl:
    process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer.hiro.so",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Tic Tac Toe",
  appIcon:
    process.env.NEXT_PUBLIC_APP_ICON ||
    "https://cryptologos.cc/logos/stacks-stx-logo.png",
} as const;
