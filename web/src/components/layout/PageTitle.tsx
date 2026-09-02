import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'BlackPearl';

const routeTitles: Record<string, string> = {
  '/': '',
  '/deals': 'Tour Deals',
  '/build-package': 'Build Your Package',
  '/profile': 'My Profile',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/deals': 'Deal Management',
  '/admin/bookings': 'Booking Management',
  '/admin/custom-packages': 'Custom Packages',
};

function getTitle(pathname: string): string {
  // Exact match first
  if (routeTitles[pathname] !== undefined) {
    return routeTitles[pathname];
  }

  // Deal detail pages
  if (pathname.startsWith('/deals/')) {
    return 'Deal Details';
  }

  // 404 / unknown
  return '';
}

export function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const sub = getTitle(pathname);
    document.title = sub ? `${sub} | ${SITE_NAME}` : SITE_NAME;
  }, [pathname]);

  return null;
}
