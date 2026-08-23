import { Sidebar } from '@/components/layout/Sidebar';
import { BookingsManager } from '@/components/admin/BookingsManager';

export default function AdminBookings() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Bookings Management</h1>
        <BookingsManager />
      </div>
    </div>
  );
}
