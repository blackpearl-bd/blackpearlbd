import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDeals } from '@/hooks/useDeals';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function DealsManager() {
  const { deals, isLoading } = useDeals();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    destination: '',
    price: 0,
    original_price: 0,
    duration_days: 1,
    max_travelers: 0,
    image_url: '',
    inclusions: '',
    exclusions: '',
    is_featured: false,
  });

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await api.createDeal({
        ...formData,
        inclusions: formData.inclusions.split('\n').filter(Boolean),
        exclusions: formData.exclusions.split('\n').filter(Boolean),
      } as any);
      toast.success('Deal created successfully');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDeal) return;
    setIsSubmitting(true);
    try {
      await api.updateDeal(selectedDeal.id, {
        ...formData,
        inclusions: formData.inclusions.split('\n').filter(Boolean),
        exclusions: formData.exclusions.split('\n').filter(Boolean),
      } as any);
      toast.success('Deal updated successfully');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await api.deleteDeal(id);
      toast.success('Deal deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      destination: '',
      price: 0,
      original_price: 0,
      duration_days: 1,
      max_travelers: 0,
      image_url: '',
      inclusions: '',
      exclusions: '',
      is_featured: false,
    });
  };

  const openEditModal = (deal: any) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      slug: deal.slug,
      description: deal.description || '',
      short_description: deal.short_description || '',
      destination: deal.destination,
      price: deal.price,
      original_price: deal.original_price || 0,
      duration_days: deal.duration_days,
      max_travelers: deal.max_travelers || 0,
      image_url: deal.image_url || '',
      inclusions: (deal.inclusions || []).join('\n'),
      exclusions: (deal.exclusions || []).join('\n'),
      is_featured: deal.is_featured,
    });
    setIsEditModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tour Deals ({deals.length})</CardTitle>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Deal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Destination</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium">{deal.title}</span>
                        {deal.is_featured && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{deal.destination}</td>
                    <td className="py-3 px-4">{formatCurrency(deal.price)}</td>
                    <td className="py-3 px-4">{deal.duration_days} days</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(deal)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(deal.id)}>
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditModalOpen ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="my-tour-deal"
                />
              </div>
              <div>
                <Label>Destination *</Label>
                <Input
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label>Short Description</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Original Price</Label>
                <Input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Duration (Days) *</Label>
                <Input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Max Travelers</Label>
                <Input
                  type="number"
                  value={formData.max_travelers}
                  onChange={(e) => setFormData({ ...formData, max_travelers: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Inclusions (one per line)</Label>
                <Textarea
                  value={formData.inclusions}
                  onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Exclusions (one per line)</Label>
                <Textarea
                  value={formData.exclusions}
                  onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <span>Featured Deal</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={isEditModalOpen ? handleEdit : handleCreate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isEditModalOpen ? 'Update Deal' : 'Create Deal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
