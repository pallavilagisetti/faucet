import {WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import React from 'react'

function Navbar() {
  return (
    <div className='flex justify-between items-center border-b-2 py-4 border-gray-500'>
        <h1 className='text-4xl font-poppins '>
            FaucetGen
        </h1>
        <WalletMultiButton />
    </div>
  )
}

export default Navbar