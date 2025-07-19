
import { useWallet } from '@solana/wallet-adapter-react'
import React from 'react'
import Token from './Token';
import ListToken from './ListToken';

function Hero() {
    const {wallet} = useWallet();
  return (
    <div className='min-h-[70vh] min-w-full flex justify-center'>
        {wallet ? <ListToken />: <h1 className='text-3xl font-light'>Oops, Your wallet is not connected</h1>}
    </div>
  )
}

export default Hero