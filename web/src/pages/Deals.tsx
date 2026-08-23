import { useState, useMemo } from 'react';
import { DealGrid } from '@/components/deals/DealGrid';
import { useDeals, useSavedDeals } from '@/hooks/useDeals';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealsPageSkeleton } from '@/components/skeletons/DealCardSkeleton';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function Deals() {
  const { deals, isLoading } = useDeals();
  const { savedDeals } = useSavedDeals();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.destination.toLowerCase().includes(searchLower)
      );
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter((d) => d.price >= min && (!max || d.price <= max));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [deals, search, sortBy, priceRange]);

  const handleSave = async (dealId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save deals');
      return;
    }

    try {
      const existing = savedDeals.find((sd) => sd.deal_id === dealId);
      if (existing) {
        await api.unsaveDeal(existing.id);
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

  if (isLoading) {
    return <DealsPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tour Deals</h1>
        <p className="text-slate-600">Explore our curated tour packages</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by destination or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-5000">Under ₹5,000</SelectItem>
            <SelectItem value="5000-15000">₹5,000 - ₹15,000</SelectItem>
            <SelectItem value="15000-30000">₹15,000 - ₹30,000</SelectItem>
            <SelectItem value="30000-999999">Over ₹30,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No deals found matching your criteria</p>
        </div>
      ) : (
        <DealGrid deals={filteredDeals} onSave={handleSave} />
      )}
    </div>
  );
}
