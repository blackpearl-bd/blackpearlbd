import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSavedDeals } from '@/hooks/useDeals';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface SaveDealButtonProps {
  dealId: string;
}

export function SaveDealButton({ dealId }: SaveDealButtonProps) {
  const { isAuthenticated } = useAuth();
  const { savedDeals } = useSavedDeals();
  const queryClient = useQueryClient();

  const isSaved = savedDeals.some((sd) => sd.deal_id === dealId);
  const savedDeal = savedDeals.find((sd) => sd.deal_id === dealId);

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save deals');
      return;
    }

    try {
      if (isSaved && savedDeal) {
        await api.unsaveDeal(savedDeal.id);
        toast.success('Deal removed from bookmarks');
      } else {
        await api.saveDeal(dealId);
        toast.success('Deal saved to bookmarks');
      }
      queryClient.invalidateQueries({ queryKey: ['saved-deals'] });
    } catch (error) {
      toast.error('Failed to update saved deal');
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
    </Button>
  );
}
