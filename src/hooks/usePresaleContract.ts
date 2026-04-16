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

  // Debug logging
  if (userAddress && isCorrectChain) {
    console.log('🔗 usePresaleContract initialized:', {
      userAddress,
      chainId,
      presaleAddress: addresses.presale,
    })
  }

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
    if (totalTokensSold !== undefined) {
      console.log('totalTokensSold from contract:', totalTokensSold?.toString?.() || totalTokensSold)
    }
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
        console.error(' No user address')
        throw new Error('No user address')
      }

      const usdtAmountWei = parseUnits(usdtAmount, 18)

      console.log(' Buying tokens with:', { 
        usdtAmount,
        usdtAmountWei: usdtAmountWei.toString(),
        presaleAddress: addresses.presale,
        userAddress,
      })

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
              onSuccess: (txHash) => {
                console.log('✅ Buy tx submitted:', txHash)
                // Refetch after block confirmation (3-5 seconds for BSC)
                setTimeout(() => {
                  console.log('Refetching contract data after buy...')
                  refetchTokensBought()
                  refetchPresaleInfo()
                  refetchTotalTokensSold()
                }, 3000)
                resolve()
              },
              onError: (error) => {
                console.error(' Buy tx failed:', error)
                reject(error)
              },
            }
          )
        } catch (error) {
          console.error(' Buy error:', error)
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
          onSuccess: (txHash) => {
            console.log('🎉 Claim transaction confirmed:', txHash)
            
            // Show success toast with claimed amount
            addToast(
              `Successfully claimed ${claimableAmount.toFixed(2)} tokens to your wallet!`,
              'success',
              4000
            )
            
            // Refetch all contract data after claim with multiple intervals for safety
            console.log('⏳ Starting refetch sequence...')
            
            setTimeout(() => {
              console.log('📊 First refetch (1.5s after tx)...')
              refetchTokensBought()
              refetchPresaleInfo()
              refetchTotalTokensSold()
            }, 1500)
            
            setTimeout(() => {
              console.log('📊 Second refetch (3.5s after tx)...')
              refetchTokensBought()
              refetchPresaleInfo()
              refetchTotalTokensSold()
            }, 3500)
          },
          onError: (error) => {
            console.error('❌ Claim failed:', error)
            const errorMsg = error?.message || 'Claim failed'
            addToast(errorMsg, 'error', 4000)
          },
        }
      )
    } catch (error) {
      console.error('❌ Claim error:', error)
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
