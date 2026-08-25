import type { ReactNode } from 'react'
import { AppTopbar } from './AppTopbar'
import { MobileDock } from './MobileDock'
import { Footer3 } from '@/components/watermelon-ui/footer-3'
import { footerNavigation } from '@/config/navigation'
import { Mail, Instagram, Facebook, Twitter } from 'lucide-react'

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

        <Footer3
          brandName="BlackPearl"
          description="Your premier tours and travel agency. Discover amazing destinations, create custom packages, and embark on unforgettable journeys."
          logo={<img src="/blackpearl.svg" alt="BlackPearl" className="w-8 h-8 dark:brightness-0 dark:invert" />}
          linkGroups={[
            {
              title: 'Quick Links',
              links: [
                { label: 'Tour Deals', href: '/deals' },
                { label: 'Build Package', href: '/build-package' },
                { label: 'My Profile', href: '/profile' },
              ],
            },
            {
              title: 'Support',
              links: footerNavigation.map((item) => ({
                label: item.name,
                href: item.href,
              })),
            },
            {
              title: 'Contact',
              links: [
                { label: 'support@blackpearl.travel', href: 'mailto:support@blackpearl.travel' },
                { label: '+91 123 456 7890', href: 'tel:+911234567890' },
                { label: 'Mumbai, India', href: '#' },
              ],
            },
          ]}
          socialLinks={[
            { icon: <Instagram className="h-4 w-4" />, href: 'https://instagram.com/blackpearl' },
            { icon: <Facebook className="h-4 w-4" />, href: 'https://facebook.com/blackpearl' },
            { icon: <Twitter className="h-4 w-4" />, href: 'https://twitter.com/blackpearl' },
            { icon: <Mail className="h-4 w-4" />, href: 'mailto:support@blackpearl.travel' },
          ]}
          copyright={`© ${new Date().getFullYear()} BlackPearl. All rights reserved.`}
          legalLinks={[
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
          ]}
        />
      </div>

      <MobileDock />
    </div>
  )
}
