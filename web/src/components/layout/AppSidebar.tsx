import { Link, useLocation } from 'react-router-dom'
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getNavigationGroups } from '@/config/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const menuButtonClassName = cn(
  'h-12 gap-2.5 rounded-xl border border-transparent px-3 text-base tracking-tight text-muted-foreground transition-colors',
  'aria-[current=page]:border-border aria-[current=page]:bg-background aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:shadow-[1px_2px_12px_rgba(158,158,158,0.08)]',
  'dark:aria-[current=page]:border-transparent dark:aria-[current=page]:bg-sidebar-accent dark:aria-[current=page]:shadow-[1px_2px_12px_rgba(0,0,0,0.25)]',
  'hover:bg-sidebar-accent data-open:bg-background data-open:text-sidebar-accent-foreground dark:data-open:bg-sidebar-accent',
  '[&_svg]:size-5!',
  'group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span]:hidden',
)

export function AppSidebar() {
  const { isAdmin, logout } = useAuth()
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const navigationGroups = getNavigationGroups(isAdmin)

  return (
    <Sidebar collapsible="icon" className="h-full border-none">
      <SidebarHeader className="h-16 flex-row items-center border-b border-sidebar-border md:h-20 px-4">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2">
          <img src="/blackpearl.svg" alt="BlackPearl" className="w-8 h-8 shrink-0" />
          <span className="truncate text-xl font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            BlackPearl
          </span>
        </Link>
        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
          aria-label={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {state === 'expanded' ? (
            <ChevronsLeft className="size-5 text-muted-foreground" />
          ) : (
            <ChevronsRight className="size-5 text-muted-foreground" />
          )}
        </button>
      </SidebarHeader>

      <SidebarContent className="gap-4 overflow-x-hidden overflow-y-auto px-3 py-4 group-data-[collapsible=icon]:overflow-y-auto!">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="gap-2 p-0">
            <SidebarGroupLabel className="h-auto px-3 py-1 text-base font-normal tracking-tight text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={useIsActive(item.href)}
                      tooltip={item.name}
                      className={menuButtonClassName}
                    >
                      <Link to={item.href} onClick={() => { if (isMobile) setOpenMobile(false) }}>
                        <item.icon />
                        <span>{item.name}</span>
                        {item.badge && (
                          <SidebarMenuBadge className="sidebar-badge-shadow static ml-auto rounded bg-background px-2 py-1.5 text-sm text-muted-foreground group-aria-[current=page]/menu-button:font-medium group-aria-[current=page]/menu-button:text-sidebar-accent-foreground">
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-6 border-t border-sidebar-border px-3 py-3">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className={menuButtonClassName}
              onClick={() => logout()}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function useIsActive(href: string) {
  const { pathname } = useLocation()
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
