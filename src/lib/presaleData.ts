import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import { getContractAddresses } from '@/config/contracts'
import { PRESALE_ABI } from '@/config/abis'
import { CURRENT_NETWORK } from '@/config/networks'

/**
 * Fetch total tokens sold from presale contract using public RPC
 * No wallet connection needed - reads from blockchain directly
 */
export async function fetchInitialPresaleData(): Promise<bigint> {
  try {
    const addresses = getContractAddresses(56) // BSC Mainnet

    const publicClient = createPublicClient({
      chain: bsc,
      transport: http(CURRENT_NETWORK.rpc),
    })

    const totalTokensSold = (await publicClient.readContract({
      address: addresses.presale as `0x${string}`,
      abi: PRESALE_ABI,
      functionName: 'totalTokensSold',
    })) as bigint

    return totalTokensSold
  } catch (_error) {
    console.error('Failed to fetch initial presale data:', _error)
    // Return 0 on error - fallback to showing 0 progress
    return 0n
  }
}
