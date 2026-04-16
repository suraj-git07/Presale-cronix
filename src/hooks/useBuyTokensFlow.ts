import { useCallback, useEffect, useRef, useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, maxUint256 } from 'viem'
import { getContractAddresses } from '@/config/contracts'
import { USDT_ABI, PRESALE_ABI } from '@/config/abis'
import { useToastStore } from '@/store/toastStore'

type TransactionStep = 'idle' | 'approving' | 'approve-confirm' | 'buying' | 'buy-confirm' | 'success' | 'error'

export function useBuyTokensFlow(amountUsdt: string) {
  const { address: userAddress, chainId = 97 } = useAccount()
  const addresses = getContractAddresses(chainId)
  const [step, setStep] = useState<TransactionStep>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const addToast = useToastStore((state) => state.addToast)
  const successShownRef = useRef(false)

  const amountWei = amountUsdt ? parseUnits(amountUsdt, 18) : 0n

  // 1. Check current USDT allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdt as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [userAddress!, addresses.presale as `0x${string}`],
    query: { enabled: !!userAddress },
  })

  const needsApproval = allowance !== undefined && (allowance as bigint) < amountWei && amountWei > 0n

  // 2. Approve USDT
  const { writeContract: approve, data: approveTxHash, isPending: isApprovePending } = useWriteContract()

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    query: { enabled: !!approveTxHash },
  })

  // 3. Buy tokens
  const { writeContract: buy, data: buyTxHash, isPending: isBuyPending } = useWriteContract()

  const { isSuccess: isBuyConfirmed } = useWaitForTransactionReceipt({
    hash: buyTxHash,
    query: { enabled: !!buyTxHash },
  })

  // 4. Orchestration - After approval confirms, auto-buy
  useEffect(() => {
    if (!isApproveConfirmed || step !== 'approve-confirm') return

    console.log('Approval confirmed, now buying...')
    setStep('buying')
    
    refetchAllowance().then(() => {
      buy({
        address: addresses.presale as `0x${string}`,
        abi: PRESALE_ABI,
        functionName: 'buyTokens',
        args: [amountWei],
      })
    })
  }, [isApproveConfirmed, step, buy, addresses, amountWei, refetchAllowance])

  // 5. After buy confirms - success
  useEffect(() => {
    if (!isBuyConfirmed || step !== 'buy-confirm') return

    console.log('SUCCESS! Tokens purchased')
    setTimeout(() => {
      setStep('success')
      // Auto-reset to idle after 2 seconds
      setTimeout(() => setStep('idle'), 2000)
    }, 500)
  }, [isBuyConfirmed, step])

  // 6. Show toast when transaction is successful
  useEffect(() => {
    if (step === 'success' && !successShownRef.current) {
      successShownRef.current = true
      addToast('Tokens purchased successfully!', 'success', 3000)
    }
    
    // Reset the flag when step changes back to idle
    if (step === 'idle') {
      successShownRef.current = false
    }
  }, [step, addToast])

  // 6. Main handle buy
  const handleBuy = useCallback(async () => {
    setErrorMsg('')
    setStep('idle')

    try {
      if (!userAddress) {
        setErrorMsg('Wallet not connected')
        setStep('error')
        return
      }

      if (amountWei <= 0n) {
        setErrorMsg('Invalid amount')
        setStep('error')
        return
      }

      if (needsApproval) {
        console.log('Requesting approval...')
        setStep('approving')
        
        approve({
          address: addresses.usdt as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'approve',
          args: [addresses.presale as `0x${string}`, maxUint256],
        })
        
        // After tx is submitted, wait for confirm
        setTimeout(() => setStep('approve-confirm'), 500)
      } else {
        console.log('No approval needed, buying directly...')
        setStep('buying')
        
        buy({
          address: addresses.presale as `0x${string}`,
          abi: PRESALE_ABI,
          functionName: 'buyTokens',
          args: [amountWei],
        })
        
        setTimeout(() => setStep('buy-confirm'), 500)
      }
    } catch (e) {
      const error = e as Error & { shortMessage?: string }
      const msg = error?.shortMessage ?? error?.message ?? 'Transaction failed'
      console.error('Buy error:', msg)
      setErrorMsg(msg)
      setStep('error')
    }
  }, [userAddress, amountWei, needsApproval, approve, buy, addresses])

  // UI labels
  const label: Record<TransactionStep, string> = {
    idle: 'Buy CRONIX',
    approving: 'Approving USDT...',
    'approve-confirm': 'Confirming Approval...',
    buying: 'Buying Tokens...',
    'buy-confirm': 'Confirming Purchase...',
    success: 'Purchase Successful!',
    error: 'Retry',
  }

  const isBusy = isApprovePending || isBuyPending || step === 'approve-confirm' || step === 'buy-confirm'
  const isDone = step === 'success'

  return {
    step,
    label: label[step],
    isBusy,
    isDone,
    errorMsg,
    approveTxHash,
    buyTxHash,
    onBuy: handleBuy,
  }
}
