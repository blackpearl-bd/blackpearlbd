import { UsersTable } from '@/components/admin/UsersTable';

import { Users } from 'lucide-react';

export default function AdminUsers() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts</p>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
