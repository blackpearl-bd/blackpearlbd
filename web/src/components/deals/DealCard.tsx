import { Link } from 'react-router-dom';
import { Heart, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { TourDeal } from '@/types';

interface DealCardProps {
  deal: TourDeal;
  isSaved?: boolean;
  onSave?: () => void;
}

export function DealCard({ deal, isSaved = false, onSave }: DealCardProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={deal.image_url || '/placeholder-deal.jpg'}
          alt={deal.title}
          className="w-full h-48 object-cover"
        />
        {deal.is_featured && (
          <Badge className="absolute top-2 left-2 bg-secondary">
            Featured
          </Badge>
        )}
        {deal.original_price && deal.original_price > deal.price && (
          <Badge className="absolute top-2 right-2 bg-emerald-500">
            {Math.round((1 - deal.price / deal.original_price) * 100)}% OFF
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {deal.destination}
        </div>
        
        <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1">
          {deal.title}
        </h3>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {deal.short_description || deal.description}
        </p>
        
        <div className="flex items-center text-sm text-slate-500 mb-4">
          <Clock className="w-4 h-4 mr-1" />
          {deal.duration_days} {deal.duration_days === 1 ? 'Day' : 'Days'}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(deal.price)}
            </span>
            {deal.original_price && deal.original_price > deal.price && (
              <span className="text-sm text-slate-400 line-through ml-2">
                {formatCurrency(deal.original_price)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                if (!isAuthenticated) {
                  // TODO: Show auth modal
                  return;
                }
                onSave?.();
              }}
            >
              <Heart
                className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </Button>
            <Link to={`/deals/${deal.slug}`}>
              <Button size="sm">Book Now</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
