import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import invariant from 'tiny-invariant'

import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { useMarketInfo } from '@/domain/market-info/useMarketInfo'
import { makeAssetsInWalletList } from '@/domain/savings/makeAssetsInWalletList'
import { useSavingsInfo } from '@/domain/savings-info/useSavingsInfo'
import { useWalletInfo } from '@/domain/wallet/useWalletInfo'
import { Objective } from '@/features/actions/logic/types'
import { RiskWarning } from '@/features/dialogs/common/components/risk-acknowledgement/RiskAcknowledgement'
import { AssetInputSchema, useDebouncedDialogFormValues } from '@/features/dialogs/common/logic/form'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'

import { getFormFieldsForWithdrawDialog } from './form'
import { generateWarning } from './generateWarning'
import { createObjectives } from './objectives'
import { useSwap } from './useSwap'
import { SavingsDialogTxOverview, useTxOverview } from './useTransactionOverview'
import { getSavingsWithdrawDialogFormValidator } from './validation'

export interface RiskAcknowledgementInfo {
  onStatusChange: (acknowledged: boolean) => void
  warning?: RiskWarning
}
export interface UseSavingsWithdrawDialogResults {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  tokenToWithdraw: TokenWithValue
  pageStatus: PageStatus
  txOverview: SavingsDialogTxOverview | undefined
  riskAcknowledgement: RiskAcknowledgementInfo
}

export function useSavingsWithdrawDialog(): UseSavingsWithdrawDialogResults {
  const { marketInfo } = useMarketInfo()
  const { savingsInfo } = useSavingsInfo()
  invariant(savingsInfo, 'Savings info is not available')
  const walletInfo = useWalletInfo()

  const [pageStatus, setPageStatus] = useState<PageState>('form')

  const { assets: withdrawOptions } = makeAssetsInWalletList({ walletInfo })
  const sDaiWithBalance: TokenWithBalance = {
    token: marketInfo.sDAI,
    balance: walletInfo.findWalletBalanceForToken(marketInfo.sDAI),
  }

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getSavingsWithdrawDialogFormValidator(sDaiWithBalance)),
    defaultValues: {
      symbol: marketInfo.DAI.symbol,
      value: '',
      isMaxSelected: false,
    },
    mode: 'onChange',
  })

  const {
    debouncedFormValues: formValues,
    isDebouncing,
    isFormValid,
  } = useDebouncedDialogFormValues({
    form,
    marketInfo,
  })
  const { swapInfo, swapParams } = useSwap({ formValues, marketInfo, walletInfo })

  const objectives = createObjectives({
    swapInfo,
    swapParams,
  })
  const txOverview = useTxOverview({
    formValues,
    marketInfo,
    walletInfo,
    savingsInfo,
    swapInfo,
  })
  const tokenToWithdraw = useConditionalFreeze<TokenWithValue>(
    {
      token: formValues.token,
      value: txOverview?.tokenWithdrew ?? formValues.value,
    },
    pageStatus === 'success',
  )

  const { warning } = generateWarning({
    swapInfo,
    inputValues: formValues,
    marketInfo,
    savingsInfo,
  })
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)

  const actionsEnabled =
    ((formValues.value.gt(0) && isFormValid) || formValues.isMaxSelected) &&
    !isDebouncing &&
    (!warning || riskAcknowledged)

  return {
    selectableAssets: withdrawOptions,
    assetsFields: getFormFieldsForWithdrawDialog({ form, marketInfo, sDaiWithBalance }),
    form,
    objectives,
    tokenToWithdraw,
    pageStatus: {
      state: pageStatus,
      actionsEnabled,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    txOverview,
    riskAcknowledgement: {
      onStatusChange: setRiskAcknowledged,
      warning,
    },
  }
}
