import { http, createConfig } from 'wagmi'
import { bsc } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
const bscRpc = import.meta.env.VITE_BSC_RPC_URL

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [bsc.id]: http(bscRpc || undefined),
  },
})
