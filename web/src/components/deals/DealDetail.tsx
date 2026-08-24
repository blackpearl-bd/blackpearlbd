import { useState } from 'react';
import { Heart, Share2, Calendar, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSavedDeals } from '@/hooks/useDeals';
import { BookingModal } from '@/components/bookings/BookingModal';
import type { TourDeal } from '@/types';

interface DealDetailProps {
  deal: TourDeal;
}

export function DealDetail({ deal }: DealDetailProps) {
  const { isAuthenticated } = useAuth();
  const { savedDeals } = useSavedDeals();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isSaved = savedDeals.some((sd) => sd.deal_id === deal.id);
  const savedDeal = savedDeals.find((sd) => sd.deal_id === deal.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Image Gallery */}
      <div className="mb-8">
        <img
          src={deal.image_url || '/placeholder-deal.jpg'}
          alt={deal.title}
          className="w-full h-96 object-cover rounded-lg"
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
          <div className="flex gap-2 justify-end">
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

      {/* Itinerary */}
      {deal.itinerary && deal.itinerary.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deal.itinerary.map((day) => (
                <div key={day.day} className="border-l-2 border-secondary pl-4">
                  <h4 className="font-semibold text-primary">Day {day.day}: {day.title}</h4>
                  <p className="text-muted-foreground mt-1">{day.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
