"use client";

import {
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import React, { useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useRouter } from 'next/navigation';

interface MintTokenProps {
  mintAddress: PublicKey;
}

function MintToken({ mintAddress }: MintTokenProps) {
  const [status, setStatus] = useState('Getting Ready');
  const [mintValue, setMintValue] = useState("");
  const [pop, setPop] = useState(false);
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  async function mintTokens() {
    if (!wallet?.adapter.publicKey) {
      setStatus("Error: Wallet not connected");
      return;
    }

    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      wallet.adapter.publicKey, 
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log("Associated Token Account:", associatedTokenAccount.toBase58());

    const mintAmount = parseFloat(mintValue) * 1000000000; 
    if (isNaN(mintAmount) || mintAmount <= 0) {
      setStatus("Invalid mint value");
      return;
    }

    const instruction = createMintToInstruction(
      mintAddress,
      associatedTokenAccount,
      wallet.adapter.publicKey,
      mintAmount, 
      [],
      TOKEN_2022_PROGRAM_ID
    );

    setStatus("Minting the Tokens...");
    const tokenMintTransaction = new Transaction().add(instruction);
    await wallet.adapter.sendTransaction(tokenMintTransaction, connection);
  }

  const handleCreateToken = async (e: React.FormEvent) => {
    setPop(true);
    e.preventDefault();
    await mintTokens();
    setPop(false);
    setStatus('Minted Successfully...');
    router.refresh();
  };

  return (
    <div>
      {pop ? (
        <ThreeDot color="#5a5d8d" size="small" text={status} textColor="" />
      ) : (
        <>
          <div className="flex">
            <input
              className="w-16"
              type="number"
              placeholder="0"
              value={mintValue}
              onChange={(e) => setMintValue(e.target.value)}
              required
            />
            <button
              onClick={handleCreateToken}
              className="border p-2 rounded-md hover:scale-105 hover:bg-white hover:text-black"
            >
              Mint
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MintToken;
