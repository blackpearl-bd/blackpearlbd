import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { useAdminCustomPackages } from '@/hooks/useAdmin';

export function CustomPackagesManager() {
  const [page, setPage] = useState(1);
  const { customPackages, total, totalPages, isLoading, updateStatus, isUpdating } = useAdminCustomPackages(page);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const handleStatusUpdate = (pkgId: string, newStatus: string) => {
    updateStatus({
      id: pkgId,
      data: {
        status: newStatus,
        admin_notes: adminNotes,
        estimated_price: estimatedPrice || undefined,
      },
    });
    setIsDetailsOpen(false);
  };

  const openDetails = (pkg: any) => {
    setSelectedPackage(pkg);
    setAdminNotes(pkg.admin_notes || '');
    setEstimatedPrice(pkg.estimated_price || 0);
    setIsDetailsOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Packages ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Destination</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Budget</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Travel Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customPackages.map((pkg) => (
                    <tr key={pkg.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{pkg.user?.full_name || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{pkg.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{pkg.title || 'N/A'}</td>
                      <td className="py-3 px-4">{pkg.budget ? formatCurrency(pkg.budget) : 'N/A'}</td>
                      <td className="py-3 px-4">
                        {pkg.travel_date ? formatDate(pkg.travel_date) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(pkg.status)}>
                          {pkg.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" onClick={() => openDetails(pkg)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Custom Package Details</DialogTitle>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500">User</Label>
                    <p className="font-medium">{selectedPackage.user?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Email</Label>
                    <p className="font-medium">{selectedPackage.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Budget</Label>
                    <p className="font-medium">{selectedPackage.budget ? formatCurrency(selectedPackage.budget) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Travel Date</Label>
                    <p className="font-medium">{selectedPackage.travel_date ? formatDate(selectedPackage.travel_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Travelers</Label>
                    <p className="font-medium">{selectedPackage.num_travelers}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Accommodation</Label>
                    <p className="font-medium capitalize">{selectedPackage.accommodation_type || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Transport</Label>
                    <p className="font-medium capitalize">{selectedPackage.transport_type || 'N/A'}</p>
                  </div>
                </div>
                {selectedPackage.special_requests && (
                  <div>
                    <Label className="text-slate-500">Special Requests</Label>
                    <p className="font-medium">{selectedPackage.special_requests}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <Label>Estimated Price (₹)</Label>
                  <Input
                    type="number"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Admin Notes</Label>
                  <Input
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(selectedPackage?.id, 'rejected')}
                disabled={isUpdating}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleStatusUpdate(selectedPackage?.id, 'approved')}
                disabled={isUpdating}
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
