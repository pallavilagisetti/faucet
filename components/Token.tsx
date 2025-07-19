"use client";

import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { Atom } from "react-loading-indicators";
import { useState } from "react";
import { CircleAlert, CircleCheckBig, X } from "lucide-react";

interface TokenProp {
  onClose: () => void;
}

export default function Token({ onClose }: TokenProp): JSX.Element {
  const [status, setStatus] = useState("Creating token");
  const [loader, setLoader] = useState("load");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { wallet } = useWallet();
  const { connection } = useConnection();

  async function createToken() {
    if (!wallet || !wallet.adapter.publicKey) {
      console.error("Wallet is not connected or publicKey is not available.");
      return;
    }

    setStatus("Creating Mint Account...");
    const mintKeypair = Keypair.generate();
    const metadata = {
      mint: mintKeypair.publicKey,
      name: tokenName,
      symbol: tokenSymbol,
      uri: imageUrl,
      additionalMetadata: [],
    };
    console.log(mintKeypair.publicKey, metadata);

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.adapter.publicKey, // Use the publicKey directly here
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.adapter.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        9,
        wallet.adapter.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.adapter.publicKey,
        updateAuthority: wallet.adapter.publicKey,
      })
    );

    setStatus("Creating Token.....");
    transaction.feePayer = wallet.adapter.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.adapter.sendTransaction(transaction, connection);
    setStatus("Associating the Account.....");

    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.adapter.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const associateTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.adapter.publicKey,
        associatedTokenAccount,
        wallet.adapter.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    associateTransaction.feePayer = wallet.adapter.publicKey;
    associateTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    await wallet.adapter.sendTransaction(associateTransaction, connection);

    setStatus("Successfully Token Created");
    const instruction = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAccount,
      wallet.adapter.publicKey,
      Number(initialSupply) * 1000000000, // Convert initialSupply to a number
      [],
      TOKEN_2022_PROGRAM_ID
    );

    setStatus("Minting the Tokens.....");
    const tokenMintTransaction = new Transaction().add(instruction);
    await wallet.adapter.sendTransaction(tokenMintTransaction, connection);

    console.log(`Token created: ${mintKeypair.publicKey.toBase58()}`);
    console.log(
      `Associated Token Account: ${associatedTokenAccount.toBase58()}`
    );
  }

  console.log(status);
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    await createToken();
    setLoader("success");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      {isCreating ? (
        <div className="lg:w-[40%] w-[50%] rounded-lg bg-blue-100 text-black dark:bg-blue-200 dark:text-black p-16
">
          <div className="flex justify-between">
            <div></div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-100 dark:hover:text-black"
            >
              <X />
            </button>
          </div>
          <div className="flex justify-center">
            {loader === "success" ? (
              <div className="flex flex-col items-center gap-5 justify-center">
                <CircleCheckBig className="w-28 h-28 text-green-700" />
                <h1 className="font-poppins text-xl text-green-800">
                  Created Successfully
                </h1>
              </div>
            ) : loader === "fail" ? (
              <div className="flex flex-col items-center gap-5 justify-center">
                <CircleAlert className="w-28 h-28 text-red-700" />
                <h1 className="font-poppins text-xl text-red-800">
                  Oops! Something went wrong
                </h1>
              </div>
            ) : (
              <Atom color="#151915" size="large" text={status} textColor="" />
            )}
          </div>
        </div>
      ) : (
        <div className="lg:w-[40%] w-[50%] rounded-lg bg-black text-white dark:bg-white dark:text-black p-16">
          <div className="flex justify-between">
            <h2 className="text-4xl font-poppins font-bold mb-2">
              Create Solana Token
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-100 dark:hover:text-black"
            >
              <X />
            </button>
          </div>
          <p className="mb-4">Enter the details for your new token</p>
          <form onSubmit={handleCreateToken}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="tokenName"
                  className="block text-sm font-medium "
                >
                  Token Name
                </label>
                <input
                  id="tokenName"
                  type="text"
                  placeholder="My Awesome Token"
                  className="mt-1 block w-full px-3 py-2 border text-gray-400 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tokenSymbol"
                  className="block text-sm font-medium"
                >
                  Token Symbol
                </label>
                <input
                  id="tokenSymbol"
                  type="text"
                  placeholder="MAT"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/token-image.png"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-400 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="initialSupply"
                  className="block text-sm font-medium"
                >
                  Initial Supply
                </label>
                <input
                  id="initialSupply"
                  type="number"
                  min="0"
                  placeholder="1000"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-blue-600 text-white dark:bg-blue-700 dark:text-white hover:scale-105 transition-all delay-100"
              >
                Create Token
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
