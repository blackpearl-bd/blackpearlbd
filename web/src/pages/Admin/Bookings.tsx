import { BookingsManager } from '@/components/admin/BookingsManager';

export default function AdminBookings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Bookings Management</h1>
      <BookingsManager />
    </div>
  );
}
