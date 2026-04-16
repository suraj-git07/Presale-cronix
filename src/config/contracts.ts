import { NETWORKS } from './networks'

export const CONTRACTS = {
  // BSC Testnet
  [NETWORKS.bscTestnet.id]: {
    presale: '0xa15a9F058D7E325B14804Fe4561E0E6Acd81D3C4',
    usdt: '0x3eb9D4efD80C6cb4a0d9deB66346EDeCAbD67eEf',
    cronix: '0xd3fbe808Faa63C0bBfeA27C00cFD160362d7c3CE',
  },

  // BSC Mainnet 
  [NETWORKS.bscMainnet.id]: {
    presale: '0x', // Will add on mainnet deployment
    usdt: '0x55d398326f99059fF775485246999027B3197955', // Official USDT on BSC
    cronix: '0x', // Will add on mainnet deployment
  },
}

export function getContractAddresses(chainId: number) {
  return CONTRACTS[chainId]
}

export const PRESALE_CONFIG = {
  cronixPriceUsd: 0.05,
  walletAPercentage: 95,
  walletBPercentage: 5,
}
