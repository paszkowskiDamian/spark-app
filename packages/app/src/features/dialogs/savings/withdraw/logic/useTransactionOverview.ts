import { SwapInfo } from '@/domain/exchanges/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { SavingsInfo } from '@/domain/savings-info/types'
import { NormalizedUnitNumber, Percentage } from '@/domain/types/NumericValues'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { WalletInfo } from '@/domain/wallet/useWalletInfo'
import { DialogFormNormalizedData } from '@/features/dialogs/common/logic/form'

interface UseTxOverviewParams {
  formValues: DialogFormNormalizedData
  marketInfo: MarketInfo
  walletInfo: WalletInfo
  savingsInfo: SavingsInfo
  swapInfo: SwapInfo
}

export interface SavingsDialogTxOverview {
  exchangeRatioFromToken: Token
  exchangeRatioToToken: Token
  exchangeRatio: NormalizedUnitNumber
  sDaiToken: Token
  sDaiBalanceBefore: NormalizedUnitNumber
  sDaiBalanceAfter: NormalizedUnitNumber
  APY: Percentage
  tokenWithdrew: NormalizedUnitNumber
}

export function useTxOverview({
  marketInfo,
  formValues,
  savingsInfo,
  walletInfo,
  swapInfo,
}: UseTxOverviewParams): SavingsDialogTxOverview | undefined {
  const otherToken = formValues.token
  const sdai = marketInfo.findOneTokenBySymbol(TokenSymbol('sDAI'))
  const dai = marketInfo.findOneTokenBySymbol(TokenSymbol('DAI'))
  const sDaiBalance = walletInfo.findWalletBalanceForSymbol(TokenSymbol('sDAI'))

  if (!swapInfo.data) {
    return undefined
  }

  const sDaiAmountBaseUnit = swapInfo.data.estimate.fromAmount
  const sDaiAmount = sdai.fromBaseUnit(sDaiAmountBaseUnit)
  const otherTokenAmountBaseUnit = swapInfo.data.estimate.toAmount
  const otherTokenAmount = otherToken.fromBaseUnit(otherTokenAmountBaseUnit)

  const daiAmountNormalized = savingsInfo.convertSharesToDai({
    shares: sDaiAmount,
  })
  const daiToTokenRatio = NormalizedUnitNumber(otherTokenAmount.dividedBy(daiAmountNormalized))

  const sDaiBalanceAfter = NormalizedUnitNumber(sDaiBalance.minus(sDaiAmount))

  return {
    exchangeRatioFromToken: dai,
    exchangeRatioToToken: formValues.token,
    sDaiToken: sdai,
    exchangeRatio: daiToTokenRatio,
    sDaiBalanceBefore: sDaiBalance,
    sDaiBalanceAfter,
    APY: savingsInfo.apy,
    tokenWithdrew: otherTokenAmount,
  }
}
