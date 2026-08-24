import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookingModal } from '@/components/bookings/BookingModal';
import { useSavedDeals } from '@/hooks/useDeals';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { TourDeal } from '@/types';

export function SavedDealsSection() {
  const { savedDeals, isLoading } = useSavedDeals();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [bookingDeal, setBookingDeal] = useState<TourDeal | null>(null);

  const handleRemove = async (savedDealId: string) => {
    try {
      await api.unsaveDeal(savedDealId);
      queryClient.invalidateQueries({ queryKey: ['saved-deals'] });
      toast.success('Deal removed from bookmarks');
    } catch {
      toast.error('Failed to remove deal');
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">Loading saved deals...</p>;
  }

  if (savedDeals.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-primary-foreground/70 mx-auto mb-4" />
        <p className="text-muted-foreground text-lg mb-2">No saved deals yet</p>
        <p className="text-muted-foreground text-sm mb-4">
          Browse our tour deals and save the ones you like!
        </p>
        <Link to="/deals">
          <Button variant="outline">Browse Deals</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {savedDeals.map((saved) => {
          const deal = saved.deal;
          if (!deal) return null;

          return (
            <Card key={saved.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link
                    to={`/deals/${deal.slug}`}
                    className="sm:w-48 h-40 sm:h-auto flex-shrink-0 overflow-hidden"
                  >
                    <img
                      src={deal.image_url || '/placeholder-deal.jpg'}
                      alt={deal.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="w-4 h-4" />
                        {deal.destination}
                      </div>
                      <Link
                        to={`/deals/${deal.slug}`}
                        className="text-lg font-semibold text-primary hover:underline"
                      >
                        {deal.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {deal.short_description || deal.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="w-4 h-4" />
                        {deal.duration_days} {deal.duration_days === 1 ? 'Day' : 'Days'}
                      </div>
                    </div>

                    {/* Price + Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(deal.price)}
                        </span>
                        {deal.original_price && deal.original_price > deal.price && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {formatCurrency(deal.original_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(saved.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                        <Button size="sm" onClick={() => setBookingDeal(deal)}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Booking Modal */}
      {bookingDeal && (
        <BookingModal
          isOpen={!!bookingDeal}
          onClose={() => setBookingDeal(null)}
          deal={bookingDeal}
        />
      )}
    </>
  );
}
