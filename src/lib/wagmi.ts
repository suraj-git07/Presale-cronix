import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { NETWORKS } from '@/config/networks'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const wagmiConfig = createConfig({
  chains: [bscTestnet, bsc], // Support both testnet and mainnet
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [bscTestnet.id]: http(NETWORKS.bscTestnet.rpc),
    [bsc.id]: http(NETWORKS.bscMainnet.rpc),
  },
})
