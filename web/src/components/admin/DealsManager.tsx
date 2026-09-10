import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, Loader2, Search, MapPin, ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useDeals } from '@/hooks/useDeals';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DealRouteMap } from '@/components/deals/DealRouteMap';
import type { RouteGeometry, TourDeal, Waypoint } from '@/types';

interface GeoapifyResult {
  place_id?: string;
  formatted?: string;
  name?: string;
  lat: number;
  lon: number;
}

const geocodeCache = new Map<string, GeoapifyResult[]>();
const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;

type DealFormData = {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  destination: string;
  price: number;
  original_price: number;
  duration_days: number;
  max_travelers: number;
  image_url: string;
  inclusions: string;
  exclusions: string;
  is_featured: boolean;
  route_waypoints: Waypoint[];
  route_geometry: RouteGeometry | null;
};

const emptyForm: DealFormData = {
  title: '', slug: '', description: '', short_description: '', destination: '',
  price: 0, original_price: 0, duration_days: 1, max_travelers: 0, image_url: '',
  inclusions: '', exclusions: '', is_featured: false, route_waypoints: [], route_geometry: null,
};

function extractRouteGeometry(payload: any): RouteGeometry | null {
  const geometry = payload?.features?.[0]?.geometry || payload?.routes?.[0]?.geometry;
  if (!geometry) return null;
  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
    const coordinates = geometry.coordinates.filter((point: any) =>
      Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])),
    ).map((point: any) => [Number(point[0]), Number(point[1])] as [number, number]);
    return coordinates.length > 1 ? { type: 'LineString', coordinates } : null;
  }
  if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
    const coordinates = geometry.coordinates.flat().filter((point: any) =>
      Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])),
    ).map((point: any) => [Number(point[0]), Number(point[1])] as [number, number]);
    return coordinates.length > 1 ? { type: 'LineString', coordinates } : null;
  }
  return null;
}

export function DealsManager() {
  const { deals, isLoading } = useDeals();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<TourDeal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DealFormData>(emptyForm);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GeoapifyResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [routeMessage, setRouteMessage] = useState('');
  const [routeStats, setRouteStats] = useState<{ distance: number; time: number } | null>(null);
  const [draggingWaypointIndex, setDraggingWaypointIndex] = useState<number | null>(null);

  const setRouteWaypoints = (waypoints: Waypoint[]) => {
    setFormData((current) => ({ ...current, route_waypoints: waypoints, route_geometry: null }));
    setRouteStats(null);
    setRouteMessage('');
  };

  const addWaypoint = (waypoint: Waypoint) => {
    setFormData((current) => ({
      ...current,
      route_waypoints: [...current.route_waypoints, waypoint],
      route_geometry: null,
    }));
    setRouteStats(null);
    setRouteMessage('');
    setSearchResults([]);
    setSearchText('');
  };

  const searchPlaces = async () => {
    const query = searchText.trim();
    if (!query) return;
    if (!geoapifyKey) {
      setSearchMessage('Place search is unavailable until VITE_GEOAPIFY_API_KEY is configured. You can click the map to place a stop.');
      return;
    }
    const cacheKey = query.toLowerCase();
    setIsSearching(true);
    setSearchMessage('');
    try {
      const cachedResults = geocodeCache.get(cacheKey);
      let results: GeoapifyResult[];
      if (cachedResults) {
        results = cachedResults;
      } else {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=5&apiKey=${encodeURIComponent(geoapifyKey)}`);
        if (!response.ok) throw new Error('Search request failed');
        const payload = await response.json();
        results = (payload.results || []).filter((result: GeoapifyResult) =>
          Number.isFinite(result.lat) && Number.isFinite(result.lon),
        );
        geocodeCache.set(cacheKey, results);
      }
      setSearchResults(results);
      if (results.length === 0) setSearchMessage('No places found. Try another name or click the map to place this stop manually.');
    } catch {
      setSearchResults([]);
      setSearchMessage('Could not search places. You can click the map to place this stop manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const generateRoute = async () => {
    if (formData.route_waypoints.length < 2) {
      setRouteMessage('Add at least two stops to generate a route.');
      return;
    }
    if (!geoapifyKey) {
      setRouteMessage('Route generation is unavailable until VITE_GEOAPIFY_API_KEY is configured. The deal can still be saved with markers only.');
      return;
    }
    setIsGeneratingRoute(true);
    setRouteMessage('');
    try {
      // Round to 4 decimal places (~11m precision) — Geoapify may reject
      // full-precision Leaflet coordinates that land between road segments.
      const waypoints = formData.route_waypoints
        .map((point) => `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`)
        .join('|');
      const response = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${encodeURIComponent(waypoints)}&mode=drive&apiKey=${encodeURIComponent(geoapifyKey)}`);
      if (!response.ok) throw new Error('Routing request failed');
      const payload = await response.json();
      const geometry = extractRouteGeometry(payload);
      const properties = payload?.features?.[0]?.properties || payload?.routes?.[0];
      if (!geometry) throw new Error('No route geometry returned');
      setFormData((current) => ({ ...current, route_geometry: geometry }));
      setRouteStats({ distance: Number(properties?.distance || 0), time: Number(properties?.time || 0) });
      setRouteMessage('Route generated and ready to save.');
    } catch {
      setFormData((current) => ({ ...current, route_geometry: null }));
      setRouteStats(null);
      setRouteMessage('Route unavailable — drop a point manually or try again. The waypoints can still be saved.');
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  const reorderWaypoints = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const waypoints = [...formData.route_waypoints];
    const [movedWaypoint] = waypoints.splice(fromIndex, 1);
    waypoints.splice(toIndex, 0, movedWaypoint);
    setRouteWaypoints(waypoints);
  };

  const moveWaypoint = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= formData.route_waypoints.length) return;
    reorderWaypoints(index, nextIndex);
  };

  const updateWaypointName = (index: number, name: string) => {
    setFormData((current) => ({
      ...current,
      route_waypoints: current.route_waypoints.map((waypoint, waypointIndex) =>
        waypointIndex === index ? { ...waypoint, name } : waypoint,
      ),
    }));
  };

  const removeWaypoint = (index: number) => {
    setRouteWaypoints(formData.route_waypoints.filter((_, itemIndex) => itemIndex !== index));
  };

  const addMapWaypoint = ({ lat, lng }: { lat: number; lng: number }) => {
    addWaypoint({ name: `Pinned point ${formData.route_waypoints.length + 1}`, lat, lng });
  };

  const payloadForApi = () => ({
    ...formData,
    inclusions: formData.inclusions.split('\n').filter(Boolean),
    exclusions: formData.exclusions.split('\n').filter(Boolean),
    route_waypoints: formData.route_waypoints.length > 0 ? formData.route_waypoints : null,
    route_geometry: formData.route_geometry,
  });

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await api.createDeal(payloadForApi() as any);
      toast.success('Deal created successfully');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDeal) return;
    setIsSubmitting(true);
    try {
      await api.updateDeal(selectedDeal.id, payloadForApi() as any);
      toast.success('Deal updated successfully');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update deal');
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
    } catch {
      toast.error('Failed to delete deal');
    }
  };

  const resetRouteUi = () => {
    setSearchText('');
    setSearchResults([]);
    setSearchMessage('');
    setRouteMessage('');
    setRouteStats(null);
  };

  const resetForm = () => {
    setFormData({ ...emptyForm, route_waypoints: [] });
    resetRouteUi();
  };

  const openEditModal = (deal: TourDeal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title, slug: deal.slug, description: deal.description || '',
      short_description: deal.short_description || '', destination: deal.destination,
      price: deal.price, original_price: deal.original_price || 0, duration_days: deal.duration_days,
      max_travelers: deal.max_travelers || 0, image_url: deal.image_url || '',
      inclusions: (deal.inclusions || []).join('\n'), exclusions: (deal.exclusions || []).join('\n'),
      is_featured: deal.is_featured, route_waypoints: deal.route_waypoints || [], route_geometry: deal.route_geometry || null,
    });
    resetRouteUi();
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Package className="w-5 h-5 text-muted-foreground" />Tour Deals ({deals.length})</CardTitle>
          <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Deal</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Deal ID</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Destination</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Duration</th>
                <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody>{deals.map((deal) => (
                <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3"><div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{deal.title}</p><p className="text-xs text-muted-foreground truncate sm:hidden">{deal.destination}</p>{deal.is_featured && <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Featured</span>}</div></td>
                  <td className="py-3 px-3 text-sm text-muted-foreground font-mono hidden lg:table-cell">{deal.deal_code || '—'}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden sm:table-cell">{deal.destination}</td>
                  <td className="py-3 px-3 text-sm font-medium text-foreground">{formatCurrency(deal.price)}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">{deal.duration_days} days</td>
                  <td className="py-3 px-3"><div className="flex gap-1 justify-end"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(deal)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(deal.id)}><Trash2 className="w-4 h-4" /></Button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isEditModalOpen ? 'Edit Deal' : 'Create New Deal'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><Label>Slug *</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="my-tour-deal" /></div>
              <div><Label>Destination *</Label><Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} /></div>
              <div className="col-span-1 sm:col-span-2"><Label>Description *</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
              <div className="col-span-1 sm:col-span-2"><Label>Short Description</Label><Input value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} /></div>
              <div><Label>Price *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} /></div>
              <div><Label>Original Price</Label><Input type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })} /></div>
              <div><Label>Duration (Days) *</Label><Input type="number" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })} /></div>
              <div><Label>Max Travelers</Label><Input type="number" value={formData.max_travelers} onChange={(e) => setFormData({ ...formData, max_travelers: Number(e.target.value) })} /></div>
              <div className="col-span-1 sm:col-span-2"><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} /></div>
              <div><Label>Inclusions (one per line)</Label><Textarea value={formData.inclusions} onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })} rows={4} /></div>
              <div><Label>Exclusions (one per line)</Label><Textarea value={formData.exclusions} onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })} rows={4} /></div>

              <div className="col-span-2 border-t pt-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div><h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />Route Map</h3><p className="text-xs text-muted-foreground">Add stops in order, then generate the driving route once before saving.</p></div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formData.route_waypoints.length} stop{formData.route_waypoints.length === 1 ? '' : 's'}</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchPlaces(); } }} placeholder={geoapifyKey ? 'Search a place (e.g. Dhaka)' : 'Set Geoapify key or click the map'} disabled={!geoapifyKey} aria-label="Search for a route stop" />
                  <Button type="button" variant="outline" className="w-full shrink-0 sm:w-auto" onClick={searchPlaces} disabled={!geoapifyKey || isSearching || !searchText.trim()}><Search className="h-4 w-4 mr-1.5" />{isSearching ? 'Searching' : 'Search'}</Button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Search results are powered by Geoapify. OSM map tiles are used for display.</p>
                {searchMessage && <p className="mt-2 text-xs text-amber-700" role="status">{searchMessage}</p>}
                {searchResults.length > 0 && <div className="mt-2 divide-y rounded-md border bg-background">{searchResults.map((result, index) => <button type="button" key={result.place_id || `${result.lat}-${result.lon}-${index}`} className="block min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={() => addWaypoint({ name: result.formatted || result.name || 'Selected place', lat: result.lat, lng: result.lon })}>{result.formatted || result.name}</button>)}</div>}
                <DealRouteMap waypoints={formData.route_waypoints} geometry={formData.route_geometry} editable onMapClick={addMapWaypoint} className="mt-3 h-72" />
                <div className="mt-3 space-y-2">
                  {formData.route_waypoints.map((point, index) => <div
                    key={`${point.lat}-${point.lng}-${index}`}
                    draggable
                    onDragStart={(event) => {
                      setDraggingWaypointIndex(index);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggingWaypointIndex !== null) reorderWaypoints(draggingWaypointIndex, index);
                      setDraggingWaypointIndex(null);
                    }}
                    onDragEnd={() => setDraggingWaypointIndex(null)}
                    className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 transition-opacity sm:flex-nowrap ${draggingWaypointIndex === index ? 'opacity-40' : ''}`}
                  >
                    <span className="hidden cursor-grab text-muted-foreground sm:inline-flex" title="Drag to reorder" aria-label={`Drag stop ${index + 1} to reorder`}><GripVertical className="h-5 w-5" /></span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{index + 1}</span>
                    <Input
                      value={point.name}
                      onChange={(event) => updateWaypointName(index, event.target.value)}
                      aria-label={`Stop ${index + 1} name`}
                      className="order-1 h-10 min-w-0 basis-[calc(100%-3rem)] flex-1 sm:order-none sm:h-8"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => moveWaypoint(index, -1)} disabled={index === 0} aria-label={`Move ${point.name} up`}><ChevronUp className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => moveWaypoint(index, 1)} disabled={index === formData.route_waypoints.length - 1} aria-label={`Move ${point.name} down`}><ChevronDown className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-destructive" onClick={() => removeWaypoint(index)} aria-label={`Remove ${point.name}`}><X className="h-4 w-4" /></Button>
                  </div>)}
                  {formData.route_waypoints.length === 0 && <p className="text-xs text-muted-foreground">No stops yet. Search for a place or click anywhere on the map.</p>}
                  {formData.route_waypoints.length > 1 && <p className="text-xs text-muted-foreground">Drag stops to change the route order. Use the arrow buttons on touch devices. Reordering or adding/removing a stop requires generating the route again; renaming a stop does not.</p>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3"><Button type="button" variant="outline" onClick={generateRoute} disabled={isGeneratingRoute || formData.route_waypoints.length < 2 || !geoapifyKey}>{isGeneratingRoute ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{isGeneratingRoute ? 'Generating route...' : 'Generate route'}</Button>{routeStats && <span className="text-sm text-muted-foreground">{(routeStats.distance / 1000).toFixed(1)} km · {(routeStats.time / 60).toFixed(0)} min</span>}</div>
                {routeMessage && <p className={`mt-2 text-xs ${routeMessage.includes('ready') ? 'text-emerald-700' : 'text-amber-700'}`} role="status">{routeMessage}</p>}
                {!geoapifyKey && <p className="mt-2 text-xs text-amber-700">Geoapify features are disabled because VITE_GEOAPIFY_API_KEY is missing. You can still add manual markers and save them.</p>}
              </div>
              <div className="col-span-1 sm:col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="rounded" /><span>Featured Deal</span></label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={closeModal}>Cancel</Button><Button onClick={isEditModalOpen ? handleEdit : handleCreate} disabled={isSubmitting}>{isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{isEditModalOpen ? 'Update Deal' : 'Create Deal'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
