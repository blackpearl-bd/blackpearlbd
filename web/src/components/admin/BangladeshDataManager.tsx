import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePackageDestinations, usePackageDistricts, usePackageTourSpots } from '@/hooks/useAdmin';
import type { PackageDistrict, PackageTourSpot } from '@/types';

// Toggle switch
function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn('relative w-9 h-5 rounded-full transition-colors shrink-0', checked ? 'bg-primary' : 'bg-muted-foreground/30')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform', checked && 'translate-x-4')} />
    </button>
  );
}

export function BangladeshDataManager() {
  const { destinations } = usePackageDestinations();
  const bangladeshDivisions = destinations.filter((d) => d.category === 'Bangladesh' && d.value !== 'bangladesh-customized');

  // Fetch ALL districts and ALL tour spots at once
  const allDistricts = usePackageDistricts();
  const allTourSpots = usePackageTourSpots();

  // Build a map: division_value → districts
  const districtsByDivision = useMemo(() => {
    const map = new Map<string, PackageDistrict[]>();
    allDistricts.districts.forEach((d) => {
      const list = map.get(d.division_value) || [];
      list.push(d);
      map.set(d.division_value, list);
    });
    return map;
  }, [allDistricts.districts]);

  // Build a map: district_id → tour spots
  const spotsByDistrict = useMemo(() => {
    const map = new Map<string, PackageTourSpot[]>();
    allTourSpots.tourSpots.forEach((s) => {
      const list = map.get(s.district_id) || [];
      list.push(s);
      map.set(s.district_id, list);
    });
    return map;
  }, [allTourSpots.tourSpots]);

  // Expand/collapse state
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  // Dialogs
  const [districtDialog, setDistrictDialog] = useState<{ open: boolean; editing?: PackageDistrict; divisionValue: string }>({ open: false, divisionValue: '' });
  const [tourSpotDialog, setTourSpotDialog] = useState<{ open: boolean; editing?: PackageTourSpot; districtId: string }>({ open: false, districtId: '' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'district' | 'tour-spot'; item: any }>({ open: false, type: 'district', item: null });

  // Form state
  const [formName, setFormName] = useState('');

  const isLoading = allDistricts.isLoading || allTourSpots.isLoading;

  const toggleDivision = (value: string) => {
    setExpandedDivisions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleDistrict = (id: string) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveDistrict = () => {
    if (!formName.trim()) return;
    if (districtDialog.editing) {
      allDistricts.updateDistrict({ id: districtDialog.editing.id, data: { name: formName.trim() } });
    } else {
      allDistricts.createDistrict({ division_value: districtDialog.divisionValue, name: formName.trim() });
    }
    setDistrictDialog({ open: false, divisionValue: '' });
    setFormName('');
  };

  const handleSaveTourSpot = () => {
    if (!formName.trim()) return;
    if (tourSpotDialog.editing) {
      allTourSpots.updateTourSpot({ id: tourSpotDialog.editing.id, data: { name: formName.trim() } });
    } else {
      allTourSpots.createTourSpot({ district_id: tourSpotDialog.districtId, name: formName.trim() });
    }
    setTourSpotDialog({ open: false, districtId: '' });
    setFormName('');
  };

  const handleDelete = () => {
    if (deleteDialog.type === 'district') {
      allDistricts.deleteDistrict(deleteDialog.item.id);
    } else {
      allTourSpots.deleteTourSpot(deleteDialog.item.id);
    }
    setDeleteDialog({ open: false, type: 'district', item: null });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          Bangladesh Divisions, Districts & Tour Spots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : bangladeshDivisions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No Bangladesh divisions found. Add divisions in Package Builder Destinations first.
          </div>
        ) : (
          <div className="space-y-2">
            {bangladeshDivisions.map((division) => {
              const isExpanded = expandedDivisions.has(division.value);
              const divisionDistricts = districtsByDivision.get(division.value) || [];

              return (
                <div key={division.value} className="rounded-lg border border-border overflow-hidden">
                  {/* ── Division header ───────────────────────── */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
                    <button
                      type="button"
                      onClick={() => toggleDivision(division.value)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="font-medium text-sm text-foreground">{division.name}</span>
                      <Badge variant="secondary" className="text-xs">{divisionDistricts.length} districts</Badge>
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs"
                      onClick={() => { setFormName(''); setDistrictDialog({ open: true, divisionValue: division.value }); }}
                    >
                      <Plus className="w-3 h-3" /> Add District
                    </Button>
                  </div>

                  {/* ── Districts + Tour Spots ────────────────── */}
                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {divisionDistricts.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">No districts yet</div>
                      ) : (
                        divisionDistricts.map((district) => {
                          const isDistExpanded = expandedDistricts.has(district.id);
                          const spots = spotsByDistrict.get(district.id) || [];
                          const activeSpots = spots.filter((s) => s.is_active);

                          return (
                            <div key={district.id}>
                              {/* District row */}
                              <div className={cn('flex items-center justify-between px-6 py-2.5', !district.is_active && 'opacity-50')}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Toggle
                                    checked={district.is_active}
                                    onToggle={() => allDistricts.updateDistrict({ id: district.id, data: { is_active: !district.is_active } })}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleDistrict(district.id)}
                                    className="flex items-center gap-1.5 text-left"
                                  >
                                    {isDistExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                    <span className="text-sm font-medium text-foreground truncate">{district.name}</span>
                                  </button>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {activeSpots.length}/{spots.length} spots
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setFormName(district.name); setDistrictDialog({ open: true, editing: district, divisionValue: district.division_value }); }}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, type: 'district', item: district })}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 gap-1 text-xs"
                                    onClick={() => { setFormName(''); setTourSpotDialog({ open: true, districtId: district.id }); }}
                                  >
                                    <Plus className="w-3 h-3" /> Spot
                                  </Button>
                                </div>
                              </div>

                              {/* Tour spots (always rendered inline, no extra fetch) */}
                              {isDistExpanded && (
                                <div className="bg-muted/30">
                                  {spots.length === 0 ? (
                                    <div className="px-10 py-2 text-xs text-muted-foreground">No tour spots</div>
                                  ) : (
                                    spots.map((spot) => (
                                      <div key={spot.id} className={cn('flex items-center justify-between px-10 py-2', !spot.is_active && 'opacity-50')}>
                                        <div className="flex items-center gap-2">
                                          <Toggle
                                            checked={spot.is_active}
                                            onToggle={() => allTourSpots.updateTourSpot({ id: spot.id, data: { is_active: !spot.is_active } })}
                                          />
                                          <span className="text-sm text-foreground">{spot.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFormName(spot.name); setTourSpotDialog({ open: true, editing: spot, districtId: spot.district_id }); }}>
                                            <Pencil className="w-3 h-3" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, type: 'tour-spot', item: spot })}>
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* District Dialog */}
        <Dialog open={districtDialog.open} onOpenChange={(v) => { if (!v) { setDistrictDialog({ open: false, divisionValue: '' }); setFormName(''); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{districtDialog.editing ? 'Edit District' : 'Add District'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>District Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Dhaka" className="mt-1" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDistrict(); }} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDistrictDialog({ open: false, divisionValue: '' }); setFormName(''); }}>Cancel</Button>
              <Button onClick={handleSaveDistrict} disabled={!formName.trim()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tour Spot Dialog */}
        <Dialog open={tourSpotDialog.open} onOpenChange={(v) => { if (!v) { setTourSpotDialog({ open: false, districtId: '' }); setFormName(''); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{tourSpotDialog.editing ? 'Edit Tour Spot' : 'Add Tour Spot'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Tour Spot Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Lalbagh Fort" className="mt-1" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTourSpot(); }} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setTourSpotDialog({ open: false, districtId: '' }); setFormName(''); }}>Cancel</Button>
              <Button onClick={handleSaveTourSpot} disabled={!formName.trim()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialog.open} onOpenChange={(v) => { if (!v) setDeleteDialog({ open: false, type: 'district', item: null }); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete {deleteDialog.type === 'district' ? 'District' : 'Tour Spot'}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteDialog.item?.name}</strong>?
              {deleteDialog.type === 'district' && ' This will also delete all tour spots under it.'}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, type: 'district', item: null })}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
