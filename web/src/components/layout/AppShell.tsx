import type { CSSProperties, ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider
      defaultOpen
      className="h-svh overflow-hidden no-scrollbar"
      style={
        {
          '--sidebar-width': '18.125rem',
          '--sidebar-width-icon': '4.25rem',
        } as CSSProperties
      }
    >
      <AppSidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
