import type { ReactNode } from 'react'
import { AppTopbar } from './AppTopbar'
import { MobileDock } from './MobileDock'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-svh flex-col overflow-hidden no-scrollbar">
      <div className="flex-1 overflow-y-auto">
        <AppTopbar />
        <main className="flex flex-1 flex-col pb-16 md:pb-0">
          {children}
        </main>
      </div>

      <MobileDock />
    </div>
  )
}
