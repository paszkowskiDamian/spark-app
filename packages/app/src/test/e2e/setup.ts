import { Page } from '@playwright/test'
import { generatePath } from 'react-router-dom'
import { Address, parseEther, parseUnits } from 'viem'

import { paths } from '@/config/paths'
import { publicTenderlyActions } from '@/domain/sandbox/publicTenderlyActions'
import { BaseUnitNumber } from '@/domain/types/NumericValues'

import { AssetsInTests, TOKENS_ON_FORK } from './constants'
import { injectFixedDate, injectNetworkConfiguration, injectWalletConfiguration } from './injectSetup'
import { blockLifiApiCalls } from './lifi'
import { ForkContext } from './setupFork'
import { generateAccount } from './utils'

export type InjectableWallet = { address: Address } | { privateKey: string }

type PathParams<K extends keyof typeof paths> = Parameters<typeof generatePath<(typeof paths)[K]>>[1]
export function buildUrl<T extends keyof typeof paths>(key: T, pathParams?: PathParams<T>): string {
  return `http://localhost:4000${generatePath(paths[key], pathParams)}`
}

export type AccountOptions<T extends 'not-connected' | 'connected'> = T extends 'connected'
  ? {
      type: T
      assetBalances?: Partial<Record<AssetsInTests, number>>
    }
  : { type: T }

export interface SetupOptions<K extends keyof typeof paths, T extends 'not-connected' | 'connected'> {
  initialPage: K
  initialPageParams?: PathParams<K>
  account: AccountOptions<T>
}

export type SetupReturn<T extends 'not-connected' | 'connected'> = T extends 'connected'
  ? {
      account: Address
      getLogs: () => string[]
    }
  : {
      getLogs: () => string[]
    }

// should be called at the beginning of any test
export async function setup<K extends keyof typeof paths, T extends 'not-connected' | 'connected'>(
  page: Page,
  forkContext: ForkContext,
  options: SetupOptions<K, T>,
): Promise<SetupReturn<T>> {
  await injectNetworkConfiguration(page, forkContext.forkUrl)
  await injectFixedDate(page, forkContext.simulationDate)
  await blockLifiApiCalls(page)
  const account = await generateAccount()

  if (options.account.type === 'connected') {
    const { assetBalances } = options.account
    await injectWalletConfiguration(page, account)

    if (assetBalances) {
      for (const [tokenName, balance] of Object.entries(assetBalances)) {
        if (tokenName === 'ETH') {
          await publicTenderlyActions.setBalance(
            forkContext.forkUrl,
            account.address,
            BaseUnitNumber(parseEther(balance.toString())),
          )
        } else {
          await publicTenderlyActions.setTokenBalance(
            forkContext.forkUrl,
            (TOKENS_ON_FORK as any)[tokenName].address,
            account.address,
            BaseUnitNumber(parseUnits(balance.toString(), (TOKENS_ON_FORK as any)[tokenName].decimals)),
          )
        }
      }
    }
  }

  const errorLogs = [] as string[]

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errorLogs.push(message.text())
    }
  })

  await page.goto(buildUrl(options.initialPage, options.initialPageParams))

  return {
    account: account.address,
    getLogs: () => errorLogs,
  } as any
}
