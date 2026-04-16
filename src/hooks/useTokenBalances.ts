import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { formatUnits } from 'viem'
import { getContractAddresses } from '@/config/contracts'
import { USDT_ABI } from '@/config/abis'

export function useTokenBalances() {
  const { address: userAddress, chainId = 97 } = useAccount()
  const addresses = getContractAddresses(chainId)

  // Get USDT balance
  const { data: usdtBalance, refetch: refetchUsdtBalance } = useReadContract({
    address: addresses.usdt as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [userAddress!],
    query: { enabled: !!userAddress, refetchInterval: 3000 }, // Refetch every 3 seconds
  })

  // Get USDT decimals (usually 18)
  const { data: usdtDecimals = 18n } = useReadContract({
    address: addresses.usdt as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'decimals',
  })

  const formatUsdtBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return formatUnits(balance as bigint, Number(usdtDecimals))
  }

  // Log USDT balance when it updates
  useEffect(() => {
    if (usdtBalance !== undefined) {
      const formatted = formatUsdtBalance(usdtBalance as bigint | undefined)
      console.log('💰 USDT Balance updated:', { raw: (usdtBalance as bigint)?.toString?.() || usdtBalance, formatted })
    }
  }, [usdtBalance, usdtDecimals])

  return {
    usdtBalance,
    usdtBalanceFormatted: formatUsdtBalance(usdtBalance as bigint | undefined),
    usdtDecimals: Number(usdtDecimals),
    refetchUsdtBalance,
  }
}
