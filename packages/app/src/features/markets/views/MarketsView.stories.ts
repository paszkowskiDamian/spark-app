import { WithTooltipProvider } from '@storybook/decorators'
import { Meta, StoryObj } from '@storybook/react'
import { tokens } from '@storybook/tokens'
import { getMobileStory, getTabletStory } from '@storybook/viewports'
import { withRouter } from 'storybook-addon-react-router-v6'

import { NormalizedUnitNumber, Percentage } from '@/domain/types/NumericValues'

import { MarketsView } from './MarketsView'

const meta: Meta<typeof MarketsView> = {
  title: 'Features/Markets/Views/MarketsView',
  component: MarketsView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithTooltipProvider(), withRouter],
}

export default meta
type Story = StoryObj<typeof MarketsView>

export const Desktop: Story = {
  args: {
    marketStats: {
      totalMarketSizeUSD: NormalizedUnitNumber(2.2 * 10 ** 12),
      totalValueLockedUSD: NormalizedUnitNumber(1.5 * 10 ** 12),
      totalAvailableUSD: NormalizedUnitNumber(1.4 * 10 ** 12),
      totalBorrowsUSD: NormalizedUnitNumber(828.48 * 10 ** 9),
    },
    chainName: 'Ethereum Mainnet',
    activeAndPausedMarketEntries: [
      {
        token: tokens['ETH'],
        reserveStatus: 'active',
        borrowAPYDetails: { apy: Percentage(0.11), incentives: [], airdrops: [] },
        depositAPYDetails: {
          apy: Percentage(0.157),
          airdrops: [{ id: 'SPK', amount: NormalizedUnitNumber(6_000_000) }],
          incentives: [{ token: tokens['stETH'], APR: Percentage(0.1) }],
        },
        totalBorrowed: NormalizedUnitNumber(0),
        totalSupplied: NormalizedUnitNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
      {
        token: tokens['DAI'],
        reserveStatus: 'active',
        borrowAPYDetails: {
          apy: Percentage(0.11),
          incentives: [],
          airdrops: [{ id: 'SPK', amount: NormalizedUnitNumber(24_000_000) }],
        },
        depositAPYDetails: {
          apy: Percentage(0.157),
          incentives: [],
          airdrops: [],
        },
        totalBorrowed: NormalizedUnitNumber(1257),
        totalSupplied: NormalizedUnitNumber(0),
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
      {
        token: tokens['USDT'],
        reserveStatus: 'paused',
        borrowAPYDetails: {
          apy: Percentage(0),
          incentives: [],
          airdrops: [],
        },
        depositAPYDetails: {
          apy: Percentage(0),
          incentives: [],
          airdrops: [],
        },
        totalBorrowed: NormalizedUnitNumber(1257),
        totalSupplied: NormalizedUnitNumber(0),
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
    ],
    frozenMarketEntries: [
      {
        token: tokens['GNO'],
        reserveStatus: 'frozen',
        borrowAPYDetails: { apy: Percentage(0.11), incentives: [], airdrops: [] },
        depositAPYDetails: { apy: Percentage(0.157), incentives: [], airdrops: [] },
        totalBorrowed: NormalizedUnitNumber(0),
        totalSupplied: NormalizedUnitNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
      {
        token: tokens['USDC'],
        reserveStatus: 'frozen',
        borrowAPYDetails: { apy: Percentage(0.11), incentives: [], airdrops: [] },
        depositAPYDetails: { apy: Percentage(0.157), incentives: [], airdrops: [] },
        totalBorrowed: NormalizedUnitNumber(1257),
        totalSupplied: NormalizedUnitNumber(0),
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
    ],
    chainId: 1,
  },
}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)
