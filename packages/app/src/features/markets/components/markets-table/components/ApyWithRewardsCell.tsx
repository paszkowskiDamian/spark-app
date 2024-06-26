import { cva, VariantProps } from 'class-variance-authority'

import { formatPercentage } from '@/domain/common/format'
import { ReserveStatus } from '@/domain/market-info/reserve-status'
import { Percentage } from '@/domain/types/NumericValues'
import { Token } from '@/domain/types/Token'
import { APYDetails } from '@/features/markets/types'
import { Typography } from '@/ui/atoms/typography/Typography'
import { MobileViewOptions } from '@/ui/molecules/data-table/types'
import { cn } from '@/ui/utils/style'

import { AirdropBadge } from '../../airdrop-badge/AirdropBadge'
import { RewardBadge } from '../../reward-badge/RewardBadge'

interface ApyWithRewardsCellProps extends VariantProps<typeof variants> {
  apyDetails: APYDetails
  reserveStatus: ReserveStatus
  incentivizedReserve: Token
  mobileViewOptions?: MobileViewOptions
}

export function ApyWithRewardsCell({ mobileViewOptions, ...rest }: ApyWithRewardsCellProps) {
  if (mobileViewOptions?.isMobileView) {
    return (
      <div className="flex flex-row items-center justify-between">
        <Typography variant="prompt">{mobileViewOptions.rowTitle}</Typography>
        <CellContent {...rest} />
      </div>
    )
  }

  return <CellContent {...rest} />
}

type CellContentProps = Omit<ApyWithRewardsCellProps, 'mobileViewOptions'>

function CellContent({ apyDetails, reserveStatus, incentivizedReserve, bold }: CellContentProps) {
  if (reserveStatus !== 'active') {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <CellValue value={apyDetails.apy} dimmed hideEmpty bold={bold} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-1 lg:gap-1.5">
      {apyDetails.airdrops.map((airdrop, index) => (
        <AirdropBadge key={index} value={airdrop.amount} />
      ))}
      {apyDetails.incentives.map((reward, index) => (
        <RewardBadge
          key={index}
          rewardToken={reward.token.symbol}
          rewardApr={reward.APR}
          incentivizedReserve={incentivizedReserve.symbol}
        />
      ))}
      <CellValue value={apyDetails.apy} hideEmpty bold={bold} />
    </div>
  )
}

interface CellValueProps extends VariantProps<typeof variants> {
  value: Percentage
  dimmed?: boolean
  hideEmpty?: boolean
}

function CellValue({ value, hideEmpty, bold, dimmed }: CellValueProps) {
  return (
    <div className={cn(variants({ bold, dimmed }))}>{hideEmpty && value.isZero() ? '—' : formatPercentage(value)}</div>
  )
}

const variants = cva('', {
  variants: {
    bold: {
      true: 'font-bold',
    },
    dimmed: {
      true: 'text-basics-dark-grey/70',
    },
  },
})
