import { NormalizedUnitNumber } from '@/domain/types/NumericValues'
import { Token } from '@/domain/types/Token'

interface ActionDetailsProps {
  label: string
  token: Token
  value: NormalizedUnitNumber
}

export function ActionDetails({ label, token, value }: ActionDetailsProps) {
  return (
    <div className="flex flex-col">
      <p className="text-xs leading-none text-slate-500">{label}</p>
      <p className="text-base text-sky-950">
        {token.format(value, { style: 'auto' })} {token.symbol}
      </p>
      <div className="text-xs leading-none text-slate-500">{token.formatUSD(value)}</div>
    </div>
  )
}
