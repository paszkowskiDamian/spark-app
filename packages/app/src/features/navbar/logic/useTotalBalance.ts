import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId, useConfig } from 'wagmi'

import { getNativeAssetInfo } from '@/config/chain/utils/getNativeAssetInfo'
import { aaveDataLayer } from '@/domain/market-info/aave-data-layer/query'
import { marketInfo as marketInfoSelect } from '@/domain/market-info/marketInfo'
import { CheckedAddress } from '@/domain/types/CheckedAddress'
import { NormalizedUnitNumber } from '@/domain/types/NumericValues'
import { balances } from '@/domain/wallet/balances'

import { BalanceInfo } from '../types'

export function useTotalBalance(): BalanceInfo {
  const wagmiConfig = useConfig()
  const { address } = useAccount()
  const chainId = useChainId()
  const nativeAssetInfo = getNativeAssetInfo(chainId)

  const walletInfo = useQuery({
    ...balances({
      wagmiConfig,
      account: address && CheckedAddress(address),
      chainId,
    }),
  })

  const marketInfo = useQuery({
    ...aaveDataLayer({
      wagmiConfig,
      account: address && CheckedAddress(address),
      chainId,
    }),
    select: (aaveData) => marketInfoSelect(aaveData, nativeAssetInfo, chainId),
  })

  const balancesUSD = (walletInfo.data ?? []).map(({ address, balanceBaseUnit }) => {
    const token = marketInfo.data?.findOneReserveByUnderlyingAsset(address).token
    if (!token) {
      return NormalizedUnitNumber(0)
    }

    return token.toUSD(token.fromBaseUnit(balanceBaseUnit))
  })

  const totalBalanceUSD = balancesUSD.reduce(
    (sum, balance) => NormalizedUnitNumber(sum.plus(balance)),
    NormalizedUnitNumber(0),
  )

  return {
    totalBalanceUSD,
    isLoading: walletInfo.isLoading || marketInfo.isLoading,
  }
}
