import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Search, Bell, User, Menu, X, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getNavigationGroups } from '@/config/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppTopbar() {
  const { user, profile, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  // Get current page name from navigation
  const navigationGroups = getNavigationGroups(isAdmin)
  const currentItem = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => item.href === pathname) ?? navigationGroups[0].items[0]

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true)
    requestAnimationFrame(() => {
      mobileSearchInputRef.current?.focus()
    })
  }

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (window.matchMedia('(width < 48rem)').matches) {
          setIsMobileSearchOpen(true)
          requestAnimationFrame(() => {
            mobileSearchInputRef.current?.focus()
          })
          return
        }
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setIsMobileSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b py-4 px-4 md:h-20 md:pr-8 md:pl-6">
      {isMobileSearchOpen ? (
        <div className="flex w-full items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={mobileSearchInputRef}
              className="h-11 pl-9 pr-3"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="size-11 shrink-0"
            onClick={closeMobileSearch}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SidebarTrigger className="size-11 shrink-0 md:hidden [&_svg]:size-5!" />
            <div className="flex items-center gap-3">
              <currentItem.icon className="hidden size-5 shrink-0 md:block" />
              <p className="truncate text-lg font-medium">
                {currentItem.name}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                className="h-11 w-70 pl-9 pr-3"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="size-11 rounded-lg md:hidden"
              onClick={openMobileSearch}
            >
              <Search className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto gap-2 px-0 aria-expanded:bg-transparent hover:bg-transparent"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="size-11 rounded-lg bg-muted object-cover"
                    />
                  ) : (
                    <div className="size-11 rounded-lg bg-muted flex items-center justify-center">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="hidden flex-col items-start gap-1 text-left md:flex">
                    <span className="text-base font-medium leading-none">
                      {profile?.full_name || 'User'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm leading-none text-muted-foreground">
                      {isAdmin && (
                        <>
                          Admin
                          <span
                            aria-hidden
                            className="block size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
                          />
                        </>
                      )}
                      {user?.email}
                    </span>
                  </div>
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
                <DropdownMenuItem onClick={logout} variant="destructive" className="p-1 m-1">
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  )
}
