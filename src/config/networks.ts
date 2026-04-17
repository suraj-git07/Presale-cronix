export const NETWORKS = {
  bscTestnet: {
    id: 97,
    name: 'BSC Testnet',
    rpc: 'https://bsc-testnet.publicnode.com',
    explorer: 'https://testnet.bscscan.com',
  },
  bscMainnet: {
    id: 56,
    name: 'BSC Mainnet',
    rpc: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com',
  },
}

export const CURRENT_NETWORK = NETWORKS.bscMainnet

export const DEFAULT_CHAIN_ID = CURRENT_NETWORK.id
