import { CustomPackagesManager } from '@/components/admin/CustomPackagesManager';

export default function AdminCustomPackages() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Custom Packages Management</h1>
      <CustomPackagesManager />
    </div>
  );
}
