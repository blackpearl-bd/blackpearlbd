import { useParams } from 'react-router-dom';
import { DealDetail as DealDetailComponent } from '@/components/deals/DealDetail';
import { useDeal } from '@/hooks/useDeals';
import { Loader2 } from 'lucide-react';

export default function DealDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { deal, isLoading } = useDeal(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <DealDetailComponent deal={deal} />
    </div>
  );
}
