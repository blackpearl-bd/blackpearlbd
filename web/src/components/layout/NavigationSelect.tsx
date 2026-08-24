'use client'

import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Package, User, HelpCircle, LayoutDashboard, Users, Calendar, MapPin } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface NavPage {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const userPages: NavPage[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'deals', label: 'Tour Deals', icon: Compass, href: '/deals' },
  { id: 'build', label: 'Build Package', icon: Package, href: '/build-package' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
]

const adminPages: NavPage[] = [
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'admin-users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'admin-deals', label: 'Deals', icon: Package, href: '/admin/deals' },
  { id: 'admin-bookings', label: 'Bookings', icon: Calendar, href: '/admin/bookings' },
  { id: 'admin-packages', label: 'Custom Packages', icon: MapPin, href: '/admin/custom-packages' },
]

function getCurrentPage(pages: NavPage[], pathname: string): NavPage | undefined {
  // Exact match first
  const exact = pages.find((p) => p.href === pathname)
  if (exact) return exact
  // Prefix match (for nested routes like /deals/some-slug)
  return pages.find((p) => p.href !== '/' && pathname.startsWith(p.href))
}

export function NavigationSelect({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const pages = isAdmin ? [...userPages, ...adminPages] : userPages
  const currentPage = getCurrentPage(pages, pathname)

  if (!currentPage) return null

  const Icon = currentPage.icon

  return (
    <>
      {/* Mobile: icon only, non-clickable */}
      <div className="flex shrink-0 items-center md:hidden">
        <Icon className="size-5" />
      </div>

      {/* Desktop: full select dropdown */}
      <Select
        value={currentPage.id}
        onValueChange={(value) => {
          const page = pages.find((p) => p.id === value)
          if (page) navigate(page.href)
        }}
      >              <SelectTrigger className={cn("hidden md:flex h-11", className)}>
          <div className="flex items-center gap-2">
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <span>{currentPage.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {pages.map((page) => {
            const PageIcon = page.icon
            return (
              <SelectItem key={page.id} value={page.id}>
                <div className="flex items-center gap-2">
                  <PageIcon className="size-5 shrink-0" />
                  <span>{page.label}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </>
  )
}
