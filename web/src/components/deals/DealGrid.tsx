import { DealCard } from './DealCard';
import { useSavedDeals } from '@/hooks/useDeals';
import { useAuth } from '@/hooks/useAuth';
import type { TourDeal } from '@/types';

interface DealGridProps {
  deals: TourDeal[];
  onSave?: (dealId: string) => void;
}

export function DealGrid({ deals, onSave }: DealGridProps) {
  const { savedDeals } = useSavedDeals();
  const { isAuthenticated } = useAuth();

  const getSavedStatus = (dealId: string) => {
    if (!isAuthenticated) return false;
    return savedDeals.some((sd) => sd.deal_id === dealId);
  };

  const getSavedId = (dealId: string) => {
    const saved = savedDeals.find((sd) => sd.deal_id === dealId);
    return saved?.id;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          isSaved={getSavedStatus(deal.id)}
          onSave={() => onSave?.(deal.id)}
        />
      ))}
    </div>
  );
}
