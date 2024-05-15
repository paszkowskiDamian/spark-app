import { SwapInfo, SwapParams } from '@/domain/exchanges/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { SavingsInfo } from '@/domain/savings-info/types'
import { NormalizedUnitNumber } from '@/domain/types/NumericValues'
import { ExchangeObjective } from '@/features/actions/flavours/exchange/types'
import { simplifyQueryResult } from '@/features/actions/logic/simplifyQueryResult'

export interface CreateObjectivesParams {
  swapInfo: SwapInfo
  swapParams: SwapParams
  marketInfo: MarketInfo
  savingsInfo: SavingsInfo
}
export function createObjectives({
  swapInfo,
  swapParams,
  marketInfo,
  savingsInfo,
}: CreateObjectivesParams): ExchangeObjective[] {
  const DAI = marketInfo.DAI
  return [
    {
      type: 'exchange',
      swapInfo: simplifyQueryResult(swapInfo),
      swapParams,
      formatAsDAIValue: (amount: NormalizedUnitNumber) =>
        DAI.format(
          savingsInfo.convertSharesToDai({
            shares: amount,
          }),
          { style: 'auto' },
        ),
    },
  ]
}
