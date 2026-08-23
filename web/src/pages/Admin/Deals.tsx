import { Sidebar } from '@/components/layout/Sidebar';
import { DealsManager } from '@/components/admin/DealsManager';

export default function AdminDeals() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Deals Management</h1>
        <DealsManager />
      </div>
    </div>
  );
}
