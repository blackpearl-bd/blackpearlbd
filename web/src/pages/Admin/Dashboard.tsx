import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStats } from '@/hooks/useAdmin';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminDashboardSkeleton';

export default function AdminDashboard() {
  const { stats, recentBookings, isLoading } = useAdminStats();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>
      
      {stats && <AdminStatsCards stats={stats} />}

      {/* Recent Bookings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent bookings</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-accent">
                      <td className="py-3 px-4">
                        <p className="font-medium">{booking.user?.full_name || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {booking.booking_type === 'deal' ? 'Deal' : 'Custom'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{formatCurrency(booking.total_amount)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(booking.booked_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
