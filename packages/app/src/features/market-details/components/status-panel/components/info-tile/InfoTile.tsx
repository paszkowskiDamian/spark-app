import { ReactNode } from 'react'

import { cn } from '@/ui/utils/style'

interface InfoTileProps {
  children: ReactNode
}
export function InfoTile({ children }: InfoTileProps) {
  return <div className="grid grid-cols-2 content-start justify-between gap-1.5 sm:grid-cols-1">{children}</div>
}

function Label({ children }: InfoTileProps) {
  return <div className="my-auto text-sm leading-none text-slate-500 sm:text-xs sm:leading-none">{children}</div>
}

function Value({ children }: InfoTileProps) {
  return (
    <div className="justify-self-end text-sm leading-none text-sky-950 sm:justify-self-start sm:text-base sm:leading-none">
      {children}
    </div>
  )
}

function ComplementaryLine({ children }: InfoTileProps) {
  return (
    <p
      className={cn(
        'col-start-2 row-start-2 justify-self-end',
        'text-xs leading-none text-slate-500',
        'sm:col-start-1 sm:row-start-3',
        'sm:justify-self-start sm:leading-none',
      )}
    >
      {children}
    </p>
  )
}

InfoTile.Label = Label
InfoTile.Value = Value
InfoTile.ComplementaryLine = ComplementaryLine
