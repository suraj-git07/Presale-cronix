import { useCallback, useEffect } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { getContractAddresses } from '@/config/contracts'
import { PRESALE_ABI } from '@/config/abis'
import { useToastStore } from '@/store/toastStore'

export function usePresaleContract() {
  const { address: userAddress, chainId } = useAccount()
  const isCorrectChain = chainId === 56 // Only on BSC mainnet
  const addresses = isCorrectChain ? getContractAddresses(chainId) : getContractAddresses(56)

  // Get presale info - ONLY on correct chain
  const { data: presaleInfo, refetch: refetchPresaleInfo } = useReadContract({
    address: addresses.presale as `0x${string}`,
    abi: PRESALE_ABI,
    functionName: 'presaleInfo',
    query: { enabled: isCorrectChain && !!addresses.presale },
  })

  // Get total tokens sold - ONLY on correct chain
  const { data: totalTokensSold, refetch: refetchTotalTokensSold } = useReadContract({
    address: addresses.presale as `0x${string}`,
    abi: PRESALE_ABI,
    functionName: 'totalTokensSold',
    query: { enabled: isCorrectChain && !!addresses.presale },
  })

  // Log total tokens sold when it updates
  useEffect(() => {
    // Silently track changes
  }, [totalTokensSold])

  // Get tokens bought by user - ONLY on correct chain
  const { data: tokensBoughtByUser, refetch: refetchTokensBought } = useReadContract({
    address: addresses.presale as `0x${string}`,
    abi: PRESALE_ABI,
    functionName: 'tokensBoughtBy',
    args: [userAddress!],
    query: { enabled: isCorrectChain && !!userAddress, refetchInterval: 3000 },
  })

  // Check if claiming is allowed - ONLY on correct chain
  const { data: claimAllowed } = useReadContract({
    address: addresses.presale as `0x${string}`,
    abi: PRESALE_ABI,
    functionName: 'claimAllowed',
    query: { enabled: isCorrectChain && !!addresses.presale },
  })

  // Buy tokens write
  const { writeContract: buyTokensWrite, isPending: isBuying } = useWriteContract()

  const handleBuyTokens = useCallback(
    async (usdtAmount: string) => {
      if (!userAddress) {
        throw new Error('No user address')
      }

      const usdtAmountWei = parseUnits(usdtAmount, 18)

      return new Promise<void>((resolve, reject) => {
        try {
          buyTokensWrite(
            {
              address: addresses.presale as `0x${string}`,
              abi: PRESALE_ABI,
              functionName: 'buyTokens',
              args: [usdtAmountWei],
              account: userAddress,
            },
            {
              onSuccess: () => {
                // Refetch after block confirmation (3-5 seconds for BSC)
                setTimeout(() => {
                  refetchTokensBought()
                  refetchPresaleInfo()
                  refetchTotalTokensSold()
                }, 3000)
                resolve()
              },
              onError: (error) => {
                reject(error)
              },
            }
          )
        } catch (error) {
          reject(error)
        }
      })
    },
    [userAddress, buyTokensWrite, addresses, refetchTokensBought, refetchPresaleInfo, refetchTotalTokensSold]
  )

  // Claim tokens function
  const { writeContract: claimTokensWrite, isPending: isClaiming } = useWriteContract()
  const addToast = useToastStore((state) => state.addToast)

  const handleClaimTokens = useCallback(async () => {
    if (!userAddress) return

    // Get the amount to claim before executing
    const claimableAmount = tokensBoughtByUser ? Number(formatUnits(tokensBoughtByUser as bigint, 18)) : 0

    try {
      claimTokensWrite(
        {
          address: addresses.presale as `0x${string}`,
          abi: PRESALE_ABI,
          functionName: 'claimTokens',
          account: userAddress,
        },
        {
          onSuccess: () => {
            // Show success toast with claimed amount
            addToast(
              `Successfully claimed ${claimableAmount.toFixed(2)} tokens to your wallet!`,
              'success',
              4000
            )
            
            // Refetch all contract data after claim with multiple intervals for safety
            setTimeout(() => {
              refetchTokensBought()
              refetchPresaleInfo()
              refetchTotalTokensSold()
            }, 1500)
            
            setTimeout(() => {
              refetchTokensBought()
              refetchPresaleInfo()
              refetchTotalTokensSold()
            }, 3500)
          },
          onError: (error) => {
            const errorMsg = error?.message || 'Claim failed'
            addToast(errorMsg, 'error', 4000)
          },
        }
      )
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Claim failed'
      addToast(errorMsg, 'error', 4000)
    }
  }, [userAddress, claimTokensWrite, addresses, refetchTokensBought, refetchPresaleInfo, refetchTotalTokensSold, tokensBoughtByUser, addToast])

  return {
    // Data
    presaleInfo,
    totalTokensSold,
    tokensBoughtByUser,
    claimAllowed: claimAllowed as boolean,

    // Functions
    onBuyTokens: handleBuyTokens,
    onClaimTokens: handleClaimTokens,

    // States
    isBuying,
    isClaiming,

    // Refetch
    refetchTokensBought,
    refetchPresaleInfo,
    refetchTotalTokensSold,
  }
}
