import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID, AccountLayout, getTokenMetadata } from '@solana/spl-token';
import { TokenAccountsFilter } from '@solana/web3.js';
import { useRouter } from 'next/navigation';
import Token from './Token';
import { Link2Icon } from 'lucide-react';
import MintToken from './MintToken';

interface TokenAccount {
  pubkey: string;
  mint: any; 
  amount: string;
  logo: string;
  name: string;
  symbol: string;
}

export default function TokenList() {
  const router = useRouter();
  
  const [accounts, setAccounts] = useState<TokenAccount[]>([]);
  const [isCreatePop, setIsCreatePop] = useState(false);
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const publicKey = wallet?.adapter.publicKey;

  async function getMetadata(mintAddress: any) {
    const metadata = await getTokenMetadata(connection, mintAddress);
    return metadata;
  }

  useEffect(() => {
    const getTokenAcc = async () => {
      if (!publicKey) return;

      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: TOKEN_2022_PROGRAM_ID,
      } as TokenAccountsFilter);

      const accountList = await Promise.all(
        tokenAccounts.value.map(async (account) => {
          const accountData = AccountLayout.decode(account.account.data);
          const mintAddress = accountData.mint;

          return getMetadata(mintAddress)
            .then((metadata) => ({
              pubkey: account.pubkey.toBase58(),
              mint: mintAddress,
              amount: accountData.amount.toString(),
              logo: metadata?.uri || '/placeholder.svg',
              name: metadata?.name || 'Token Name',
              symbol: metadata?.symbol || 'TOKEN',
            }));
        })
      );

      setAccounts(accountList);
    };

    getTokenAcc();
  }, [publicKey, connection]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-end">
        <h1 className="text-xl font-bold mb-4">Your Token Accounts:</h1>
        <button onClick={() => setIsCreatePop(true)} className="p-2 px-4 my-4 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-lg text-white hover:scale-105 transition-all delay-75">
          Create Token
        </button>
      </div>

      <table className="min-w-full">
        <thead>
          <tr>
            <th className="border-b py-2 px-4 text-left">No</th>
            <th className="border-b py-2 px-4">Logo</th>
            <th className="border-b py-2 px-4">Name</th>
            <th className="border-b py-2 px-4">Symbol</th>
            <th className="border-b py-2 px-4">Amount</th>
            <th className="border-b py-2 px-4">MintTokens</th>
            <th className="border-b py-2 px-4 text-right">Explore</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length > 0 ? (
            accounts.map((token, index) => (
              <tr key={token.pubkey} className="">
                <td className="border-b py-2 px-4 font-medium">{index + 1}</td>
                <td className="border-b py-2 px-4">
                  <img
                    src={token.logo}
                    alt={`${token.name} logo`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </td>
                <td className="border-b py-2 px-4">{token.name}</td>
                <td className="border-b py-2 px-4">{token.symbol}</td>
                <td className="border-b py-2 px-4">{(parseInt(token.amount) / 1000000000).toLocaleString()}</td>
                <td className="border-b py-2 px-4">
                  <MintToken mintAddress={token.mint} />
                </td>
                <td className="border-b py-2 px-4 text-right">
                  <a
                    className="flex justify-center items-center text-blue-900 underline"
                    href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link <Link2Icon />
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="border-b py-2 px-4 text-center">
                No token accounts found,create your token to display.
                <br />
                <button onClick={() => setIsCreatePop(true)} className="p-2 px-4 my-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg text-white hover:scale-105 transition-all delay-75">
                  Create Token
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isCreatePop && <Token onClose={() => setIsCreatePop(false)} />}
    </div>
  );
}
