import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

import { CheckedAddress } from '@/domain/types/CheckedAddress'
import { NormalizedUnitNumber } from '@/domain/types/NumericValues'
import { airdropInfo } from '@/domain/wallet/airdropInfo'

import { AirdropInfo } from '../types'

export function useAirdropInfo(): AirdropInfo {
  const { address } = useAccount()

  const result = useQuery(airdropInfo(address && CheckedAddress(address)))

  const amount = result.data?.tokenReward ?? NormalizedUnitNumber(0)
  const isLoading = result.isLoading
  const isError = result.isError

  return {
    amount,
    isLoading,
    isError,
  }
}
