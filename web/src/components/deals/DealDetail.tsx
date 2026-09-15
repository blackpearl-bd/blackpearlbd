import { useEffect, useState } from 'react';
import { Heart, Share2, Calendar, Users, MapPin, Hash, Route, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSavedDeals } from '@/hooks/useDeals';
import { BookingModal } from '@/components/bookings/BookingModal';
import { DealRouteMap, isValidWaypoint } from '@/components/deals/DealRouteMap';
import { Timeline, getThemeForDeal } from '@/components/ui/timeline';
import type { TourDeal } from '@/types';

interface DealDetailProps {
  deal: TourDeal;
}

export function DealDetail({ deal }: DealDetailProps) {
  const { isAuthenticated } = useAuth();
  const { savedDeals } = useSavedDeals();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);

  const isSaved = savedDeals.some((sd) => sd.deal_id === deal.id);
  const savedDeal = savedDeals.find((sd) => sd.deal_id === deal.id);
  const routeWaypoints = (deal.route_waypoints || []).filter(isValidWaypoint);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // Escape collapses the floating route panel without touching anything else.
  useEffect(() => {
    if (!isRouteOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsRouteOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRouteOpen]);

  return (
    <div>
      {/* Image Gallery */}
      <div className="mb-8">
        <img
          src={deal.image_url || '/placeholder-deal.jpg'}
          alt={deal.title}
          className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg"
        />
        {deal.gallery && deal.gallery.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {deal.gallery.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${deal.title} ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-md flex-shrink-0"
              />
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-secondary" />
            <span className="text-muted-foreground">{deal.destination}</span>
          </div>
          {deal.deal_code && (
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">{deal.deal_code}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-primary mb-2">{deal.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {deal.duration_days} {deal.duration_days === 1 ? 'Day' : 'Days'}
            </span>
            {deal.max_travelers && (
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Max {deal.max_travelers} travelers
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-0 text-right">
          <div className="mb-4">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(deal.price)}
            </span>
            {deal.original_price && deal.original_price > deal.price && (
              <span className="text-lg text-muted-foreground line-through ml-2">
                {formatCurrency(deal.original_price)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in to save deals');
                  return;
                }
                // Toggle save
              }}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button onClick={() => setIsBookingModalOpen(true)}>
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About this tour</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
        </CardContent>
      </Card>

      {/*
        Stored route — public pages only render the saved geometry; no routing API call.
        It lives behind a floating button: the map expands into a card on click and
        collapses again from the floating close button.
      */}
      {routeWaypoints.length > 0 && !isRouteOpen && (
        <button
          type="button"
          onClick={() => setIsRouteOpen(true)}
          aria-expanded={false}
          aria-controls="tour-route-panel"
          className="fixed bottom-28 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:bottom-6 md:right-6"
        >
          <Route className="h-5 w-5" />
          Tour route
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-xs">
            {routeWaypoints.length}
          </span>
        </button>
      )}

      {routeWaypoints.length > 0 && isRouteOpen && (
        <div className="fixed inset-x-4 bottom-28 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200 md:inset-x-auto md:bottom-6 md:right-6 md:w-[42rem]">
          <button
            type="button"
            onClick={() => setIsRouteOpen(false)}
            aria-label="Close tour route"
            className="absolute -right-2 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            id="tour-route-panel"
            className="flex max-h-[min(70vh,34rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:max-h-[min(82vh,44rem)]"
          >
            <div className="border-b border-border px-4 py-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                Tour route
              </h2>
              <p className="text-xs text-muted-foreground">
                {routeWaypoints.length} stops in order, from start to finish.
              </p>
            </div>

            <DealRouteMap
              waypoints={routeWaypoints}
              geometry={deal.route_geometry}
              className="h-[240px] w-full border-0 sm:h-[340px]"
            />

            <ol aria-label="Tour route stops" className="grid max-h-44 gap-2 overflow-y-auto border-t border-border p-3 sm:grid-cols-2">
              {routeWaypoints.map((waypoint, index) => (
                <li key={`${waypoint.lat}-${waypoint.lng}-${index}`} className="flex min-h-10 items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{index + 1}</span>
                  <span className="min-w-0 truncate">{waypoint.name || `Stop ${index + 1}`}</span>
                </li>
              ))}
            </ol>
            {routeWaypoints.length === 1 && (
              <p className="px-4 pb-3 text-xs text-muted-foreground">This tour has one marked stop; no driving route is shown.</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline Itinerary */}
      {deal.itinerary && deal.itinerary.length > 0 && (
        <div className="mb-6">
          <Timeline
            theme={getThemeForDeal(deal.title, deal.destination)}
            data={deal.itinerary.map(
              (phase) => ({
                title: phase.title || `Phase ${phase.phase}`,
                content: (
                  <div className="mb-8">
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4 whitespace-pre-wrap">
                      {phase.description}
                    </p>
                    {/* Phase-specific photos */}
                    {phase.photos && phase.photos.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {phase.photos.slice(0, 4).map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={img}
                            alt={`${phase.title || `Phase ${phase.phase}`} photo ${imgIdx + 1}`}
                            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ),
              }),
            )}
          />
        </div>
      )}

      {/* Inclusions & Exclusions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {deal.inclusions && deal.inclusions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-600">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {deal.inclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-emerald-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {deal.exclusions && deal.exclusions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-rose-600">What's Not Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {deal.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-rose-500 mr-2">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        deal={deal}
      />
    </div>
  );
}
