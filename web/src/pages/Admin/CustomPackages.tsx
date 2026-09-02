import { CustomPackagesManager } from '@/components/admin/CustomPackagesManager';
import { DestinationManager } from '@/components/admin/DestinationManager';
import { BangladeshDataManager } from '@/components/admin/BangladeshDataManager';
import { AdminNav } from '@/components/admin/AdminNav';
import { BuildPackageIcon } from '@/components/icons/BuildPackageIcon';

export default function AdminCustomPackages() {
  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BuildPackageIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Custom Packages</h1>
            <p className="text-sm text-muted-foreground">Manage package builder destinations and review requests</p>
          </div>
        </div>
        <AdminNav />
      </div>
      <div className="space-y-6">
        <DestinationManager />
        <BangladeshDataManager />
        <CustomPackagesManager />
      </div>
    </div>
  );
}
