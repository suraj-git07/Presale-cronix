import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { formatUnits } from 'viem'
import { getContractAddresses } from '@/config/contracts'
import { USDT_ABI } from '@/config/abis'

export function useTokenBalances() {
  const { address: userAddress, chainId } = useAccount()
  const isCorrectChain = chainId === 56
  const addresses = isCorrectChain ? getContractAddresses(chainId) : getContractAddresses(56)
  
  // Get USDT balance
  const { data: usdtBalance, refetch: refetchUsdtBalance, error } = useReadContract({
    address: addresses?.usdt as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: { enabled: isCorrectChain && !!userAddress },
  })

  const formatUsdtBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return formatUnits(balance, 18)
  }

  useEffect(() => {
    if (error) {
      console.error(' USDT Balance Error:', error?.message)
    }
  }, [error])

  return {
    usdtBalance,
    usdtBalanceFormatted: usdtBalance ? formatUsdtBalance(usdtBalance as bigint) : '0',
    refetchUsdtBalance,
  }
}
