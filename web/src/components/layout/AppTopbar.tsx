import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Search,
  User,
  Settings,
  LogOut,
  Home,
  Compass,
  Package,
  LayoutDashboard,
  Users,
  Calendar,
  MapPin,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
  Phone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CommandPalette,
  type CommandItem,
} from '@/components/ui/command-palette'
import { NavigationSelect } from './NavigationSelect'
import { useTheme } from '@/lib/theme-provider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SlideActionButton } from '@/components/ui/slide-action-button'

function useCommandPaletteItems() {
  const navigate = useNavigate()
  const { isAdmin, logout } = useAuth()

  const items: CommandItem[] = [
    {
      id: 'home',
      label: 'Home',
      group: 'Navigation',
      icon: Home as LucideIcon,
      hint: '/',
      onSelect: () => navigate('/'),
    },
    {
      id: 'deals',
      label: 'Tour Deals',
      group: 'Navigation',
      icon: Compass as LucideIcon,
      hint: '/deals',
      onSelect: () => navigate('/deals'),
    },
    {
      id: 'build-package',
      label: 'Build Package',
      group: 'Navigation',
      icon: Package as LucideIcon,
      hint: '/build-package',
      onSelect: () => navigate('/build-package'),
    },
    {
      id: 'profile',
      label: 'My Profile',
      group: 'Navigation',
      icon: User as LucideIcon,
      hint: '/profile',
      onSelect: () => navigate('/profile'),
    },
  ]

  if (isAdmin) {
    items.push(
      {
        id: 'admin-dashboard',
        label: 'Admin Dashboard',
        group: 'Admin',
        icon: LayoutDashboard as LucideIcon,
        hint: '/admin',
        onSelect: () => navigate('/admin'),
      },
      {
        id: 'admin-users',
        label: 'Manage Users',
        group: 'Admin',
        icon: Users as LucideIcon,
        hint: '/admin/users',
        onSelect: () => navigate('/admin/users'),
      },
      {
        id: 'admin-deals',
        label: 'Manage Deals',
        group: 'Admin',
        icon: Package as LucideIcon,
        hint: '/admin/deals',
        onSelect: () => navigate('/admin/deals'),
      },
      {
        id: 'admin-bookings',
        label: 'Manage Bookings',
        group: 'Admin',
        icon: Calendar as LucideIcon,
        hint: '/admin/bookings',
        onSelect: () => navigate('/admin/bookings'),
      },
      {
        id: 'admin-packages',
        label: 'Custom Packages',
        group: 'Admin',
        icon: MapPin as LucideIcon,
        hint: '/admin/custom-packages',
        onSelect: () => navigate('/admin/custom-packages'),
      },
    )
  }

  items.push({
    id: 'help',
    label: 'Help & Support',
    group: 'Actions',
    icon: HelpCircle as LucideIcon,
    onSelect: () => window.open('https://blackpearl.travel/support', '_blank'),
  })

  items.push({
    id: 'logout',
    label: 'Log Out',
    group: 'Actions',
    icon: LogOut as LucideIcon,
    onSelect: () => {
      logout()
      navigate('/')
    },
  })

  return items
}

export function AppTopbar({ className }: { className?: string }) {
  const { user, profile, isAdmin, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const commandItems = useCommandPaletteItems()

  const openPalette = useCallback(() => setPaletteOpen(true), [])

  return (
    <>
      <CommandPalette
        items={commandItems}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        placeholder="Search pages, actions…"
      />

      <header className={cn("sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b py-4 px-4 md:h-20 md:pr-8 md:pl-6 bg-background", className)}>
        {/* Left: BlackPearl logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 z-10">
          <img src="/blackpearl.svg" alt="BlackPearl" className="size-9 shrink-0" />
          <span className="text-2xl font-semibold tracking-tight">
            BlackPearl
          </span>
        </Link>

        {/* Right: Navigation select + Search + Profile */}
        <div className="flex shrink-0 items-center gap-2 z-10">
          {/* Call button */}
          <Popover open={callOpen} onOpenChange={setCallOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="!h-11 !w-11 rounded-lg hidden md:flex"
                aria-label="Call us"
              >
                <Phone className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-auto p-4"
            >
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-foreground">
                  Slide to call us
                </p>
                <SlideActionButton
                  completeLabel="Calling…"
                  onComplete={() => {
                    window.location.href = 'tel:+8801928319460'
                  }}
                >
                  Call +880 192-831-9460
                </SlideActionButton>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search button — opens command palette */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="!h-11 !w-11 rounded-lg"
            onClick={openPalette}
            aria-label="Open search (⌘K)"
          >
            <Search className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="!h-11 !w-11 rounded-lg px-0 aria-expanded:bg-transparent hover:bg-accent"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="!size-11 rounded-lg bg-muted object-cover"
                  />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0">
              <div className="space-y-3 p-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="size-10 rounded-lg bg-muted object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                        <User className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  onClick={() => setTheme('light')}
                  className={cn(theme === 'light' && 'bg-accent text-accent-foreground')}
                >
                  <Sun className="size-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('dark')}
                  className={cn(theme === 'dark' && 'bg-accent text-accent-foreground')}
                >
                  <Moon className="size-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('system')}
                  className={cn(theme === 'system' && 'bg-accent text-accent-foreground')}
                >
                  <Monitor className="size-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} variant="destructive" className="p-1 m-1">
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Navigation select */}
          <NavigationSelect className="w-48" />
        </div>
      </header>
    </>
  )
}
