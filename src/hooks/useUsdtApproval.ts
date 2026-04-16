import { useCallback } from 'react'
import { useReadContract, useSimulateContract, useWriteContract, useAccount } from 'wagmi'
import { parseUnits, maxUint256 } from 'viem'
import { getContractAddresses } from '@/config/contracts'
import { USDT_ABI } from '@/config/abis'

export function useUsdtApproval(amountUsdt: string) {
  const { address: userAddress, chainId = 97 } = useAccount()
  const addresses = getContractAddresses(chainId)

  const amountWei = amountUsdt ? parseUnits(amountUsdt, 18) : 0n

  // Check current USDT allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdt as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [userAddress!, addresses.presale as `0x${string}`],
    query: { enabled: !!userAddress },
  })

  const needsApprovalCheck = () => {
    if (!allowance) return false
    const allowanceBig = allowance as bigint
    if (!amountUsdt || amountWei === 0n) return false
    return allowanceBig < amountWei
  }

  // Simulate approval transaction
  const { data: simulationResult } = useSimulateContract({
    address: addresses.usdt as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'approve',
    args: [addresses.presale as `0x${string}`, maxUint256],
    account: userAddress,
    query: { enabled: !!userAddress && needsApprovalCheck() },
  })

  // Write approval
  const { writeContract: writeApprove, isPending: isApproving } = useWriteContract()

  const handleApprove = useCallback(async (): Promise<void> => {
    if (!simulationResult?.request) {
      console.warn(' No approval needed, allowance already sufficient')
      return
    }

    return new Promise((resolve, reject) => {
      console.log(' Requesting approval for USDT...')
      
      writeApprove(simulationResult.request, {
        onSuccess: (txHash) => {
          console.log(' Approval tx submitted:', txHash)
          // Wait a bit then refetch
          setTimeout(() => {
            refetchAllowance()
            console.log(' Approval confirmed!')
            resolve()
          }, 3000)
        },
        onError: (error) => {
          console.error(' Approval failed:', error)
          reject(error)
        },
      })
    })
  }, [simulationResult, writeApprove, refetchAllowance])

  return {
    needsApproval: needsApprovalCheck(),
    isApproving,
    onApprove: handleApprove,
    refetchAllowance,
  }
}