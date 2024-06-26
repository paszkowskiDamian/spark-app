import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import invariant from 'tiny-invariant'

import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { useMarketInfo } from '@/domain/market-info/useMarketInfo'
import { makeAssetsInWalletList } from '@/domain/savings/makeAssetsInWalletList'
import { useSavingsInfo } from '@/domain/savings-info/useSavingsInfo'
import { Token } from '@/domain/types/Token'
import { useWalletInfo } from '@/domain/wallet/useWalletInfo'
import { Objective } from '@/features/actions/logic/types'
import { RiskWarning } from '@/features/dialogs/common/components/risk-acknowledgement/RiskAcknowledgement'
import { AssetInputSchema, useDebouncedDialogFormValues } from '@/features/dialogs/common/logic/form'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'

import { getFormFieldsForDepositDialog } from './form'
import { generateWarning } from './generateWarning'
import { createObjectives } from './objectives'
import { useSwap } from './useSwap'
import { SavingsDialogTxOverview, useTxOverview } from './useTransactionOverview'
import { getSavingsDepositDialogFormValidator } from './validation'

export interface UseSavingsDepositDialogParams {
  initialToken: Token
}

export interface RiskAcknowledgementInfo {
  onStatusChange: (acknowledged: boolean) => void
  warning?: RiskWarning
}

export interface UseSavingsDepositDialogResults {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  tokenToDeposit: TokenWithValue
  pageStatus: PageStatus
  txOverview: SavingsDialogTxOverview | undefined
  riskAcknowledgement: RiskAcknowledgementInfo
}

export function useSavingsDepositDialog({
  initialToken,
}: UseSavingsDepositDialogParams): UseSavingsDepositDialogResults {
  const { marketInfo } = useMarketInfo()
  const { savingsInfo } = useSavingsInfo()
  invariant(savingsInfo, 'Savings info is not available')
  const walletInfo = useWalletInfo()
  const { assets: depositOptions } = makeAssetsInWalletList({ walletInfo })

  const [pageStatus, setPageStatus] = useState<PageState>('form')

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getSavingsDepositDialogFormValidator(walletInfo)),
    defaultValues: {
      symbol: initialToken.symbol,
      value: '',
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

  const { warning } = generateWarning({
    swapInfo,
    inputValues: formValues,
    marketInfo,
    savingsInfo,
  })
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)

  const objectives = createObjectives({
    swapInfo,
    swapParams,
    marketInfo,
    savingsInfo,
  })
  const txOverview = useTxOverview({
    marketInfo,
    savingsInfo,
    swapInfo,
    walletInfo,
    swapParams,
  })

  const tokenToDeposit: TokenWithValue = {
    token: formValues.token,
    value: formValues.value,
  }
  const actionsEnabled = formValues.value.gt(0) && isFormValid && !isDebouncing && (!warning || riskAcknowledged)

  return {
    selectableAssets: depositOptions,
    assetsFields: getFormFieldsForDepositDialog(form, marketInfo, walletInfo),
    form,
    objectives,
    tokenToDeposit,
    txOverview,
    pageStatus: {
      state: pageStatus,
      actionsEnabled,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    riskAcknowledgement: {
      onStatusChange: setRiskAcknowledged,
      warning,
    },
  }
}
