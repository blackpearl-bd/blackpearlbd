import { UsersTable } from '@/components/admin/UsersTable';

export default function AdminUsers() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Users Management</h1>
      <UsersTable />
    </div>
  );
}
