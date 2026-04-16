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
    presale: '0x9C07B38340b22269B48a773428a52ed05647f52D',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
    cronix: '0x3242A362d3b403C1137d1b51c96e6f209080181b',
  },
}

export function getContractAddresses(chainId: number) {
  return CONTRACTS[chainId]
}

export const PRESALE_CONFIG = {
  cronixPriceUsd: 0.15,
  walletAPercentage: 95,
  walletBPercentage: 5,
}
