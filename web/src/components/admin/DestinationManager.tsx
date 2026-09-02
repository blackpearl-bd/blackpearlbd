import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Compass, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePackageDestinations } from '@/hooks/useAdmin';
import type { PackageDestination } from '@/types';

export function DestinationManager() {
  const { destinations, isLoading, createDestination, updateDestination, deleteDestination, isCreating } =
    usePackageDestinations();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<PackageDestination | null>(null);
  const [deletingDest, setDeletingDest] = useState<PackageDestination | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form state
  const [formCategory, setFormCategory] = useState('');
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  // Group destinations by category
  const grouped = destinations.reduce<Record<string, PackageDestination[]>>((acc, dest) => {
    if (!acc[dest.category]) acc[dest.category] = [];
    acc[dest.category].push(dest);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const resetForm = () => {
    setFormCategory('');
    setFormName('');
    setFormValue('');
    setFormSortOrder(0);
    setFormIsActive(true);
  };

  const openAdd = (category?: string) => {
    resetForm();
    if (category) setFormCategory(category);
    setIsAddOpen(true);
  };

  const openEdit = (dest: PackageDestination) => {
    setFormCategory(dest.category);
    setFormName(dest.name);
    setFormValue(dest.value);
    setFormSortOrder(dest.sort_order);
    setFormIsActive(dest.is_active);
    setEditingDest(dest);
  };

  const handleCreate = () => {
    if (!formCategory.trim() || !formName.trim() || !formValue.trim()) return;
    createDestination(
      {
        category: formCategory.trim(),
        name: formName.trim(),
        value: formValue.trim(),
        sort_order: formSortOrder,
        is_active: formIsActive,
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          resetForm();
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editingDest) return;
    updateDestination(
      {
        id: editingDest.id,
        data: {
          category: formCategory.trim(),
          name: formName.trim(),
          value: formValue.trim(),
          sort_order: formSortOrder,
          is_active: formIsActive,
        },
      },
      { onSuccess: () => setEditingDest(null) },
    );
  };

  const handleDelete = () => {
    if (!deletingDest) return;
    deleteDestination(deletingDest.id, { onSuccess: () => setDeletingDest(null) });
  };

  const handleToggleActive = (dest: PackageDestination) => {
    updateDestination({ id: dest.id, data: { is_active: !dest.is_active } });
  };

  const autoSlugify = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="w-5 h-5 text-muted-foreground" />
            Package Builder Destinations
          </CardTitle>
          <Button size="sm" onClick={() => openAdd()} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Destination
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No destinations yet. Add one to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => {
              const items = grouped[cat];
              const isExpanded = expandedCategories.has(cat) || categories.length <= 3;
              const activeCount = items.filter((d) => d.is_active).length;

              return (
                <div key={cat} className="rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm text-foreground">{cat}</span>
                      <Badge variant="secondary" className="text-xs">
                        {activeCount}/{items.length}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAdd(cat);
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {items.map((dest) => (
                        <div
                          key={dest.id}
                          className={cn(
                            'flex items-center justify-between px-4 py-2.5 transition-colors',
                            !dest.is_active && 'opacity-50',
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(dest)}
                              className={cn(
                                'relative w-9 h-5 rounded-full transition-colors shrink-0',
                                dest.is_active ? 'bg-primary' : 'bg-muted-foreground/30',
                              )}
                            >
                              <span
                                className={cn(
                                  'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                                  dest.is_active && 'translate-x-4',
                                )}
                              />
                            </button>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{dest.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{dest.value}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(dest)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeletingDest(dest)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Destination</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Bangladesh, Asia, Europe"
                  className="mt-1"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Display Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formValue) setFormValue(autoSlugify(e.target.value));
                  }}
                  placeholder="e.g. Thailand"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Value (slug)</Label>
                <Input
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. thailand"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="mt-1"
                    min={0}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !formCategory.trim() || !formName.trim() || !formValue.trim()}
              >
                Add Destination
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingDest} onOpenChange={() => setEditingDest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Destination</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Bangladesh, Asia, Europe"
                  className="mt-1"
                  list="category-suggestions-edit"
                />
                <datalist id="category-suggestions-edit">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Display Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Thailand"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Value (slug)</Label>
                <Input
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. thailand"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="mt-1"
                    min={0}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDest(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deletingDest} onOpenChange={() => setDeletingDest(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Destination</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deletingDest?.name}</strong>? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingDest(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
