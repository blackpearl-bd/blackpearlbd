import { Sidebar } from '@/components/layout/Sidebar';
import { CustomPackagesManager } from '@/components/admin/CustomPackagesManager';

export default function AdminCustomPackages() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Custom Packages Management</h1>
        <CustomPackagesManager />
      </div>
    </div>
  );
}
