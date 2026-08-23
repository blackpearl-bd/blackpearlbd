import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/deals', label: 'Deals', icon: Package },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/custom-packages', label: 'Custom Packages', icon: MapPin },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-4">
        <Link
          to="/"
          className="flex items-center space-x-2 text-slate-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Site</span>
        </Link>

        <h2 className="text-lg font-semibold text-primary mb-4">Admin Panel</h2>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
