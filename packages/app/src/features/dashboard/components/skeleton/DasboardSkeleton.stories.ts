import { Meta, StoryObj } from '@storybook/react'
import { chromatic } from '@storybook/viewports'

import { DashboardSkeleton } from './DashboardSkeleton'

const meta: Meta<typeof DashboardSkeleton> = {
  title: 'Features/Dashboard/Components/Skeleton',
  component: DashboardSkeleton,
}

export default meta
type Story = StoryObj<typeof DashboardSkeleton>

export const Desktop: Story = {}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    chromatic: { viewports: [chromatic.mobile] },
  },
}
