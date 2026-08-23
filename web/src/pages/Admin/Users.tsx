import { Sidebar } from '@/components/layout/Sidebar';
import { UsersTable } from '@/components/admin/UsersTable';

export default function AdminUsers() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Users Management</h1>
        <UsersTable />
      </div>
    </div>
  );
}
