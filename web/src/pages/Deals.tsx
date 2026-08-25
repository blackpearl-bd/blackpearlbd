import { useState, useMemo } from 'react';
import Career3, { type JobListing } from '@/components/watermelon-ui/career-3';
import { useDeals, useSavedDeals } from '@/hooks/useDeals';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealsPageSkeleton } from '@/components/skeletons/DealCardSkeleton';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function Deals() {
  const { deals, isLoading } = useDeals();
  const { savedDeals } = useSavedDeals();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Derive unique destinations as department tabs
  const departments = useMemo(() => {
    const dests = [...new Set(deals.map((d) => d.destination))];
    return dests.length > 0 ? ['All', ...dests] : ['All'];
  }, [deals]);

  // Map TourDeal → JobListing for Career3
  const allJobs: JobListing[] = useMemo(() => {
    return deals.map((deal) => ({
      id: deal.id,
      title: deal.title,
      description: deal.short_description || deal.description || '',
      location: deal.destination,
      type: deal.duration_days === 1 ? '1 Day' : `${deal.duration_days} Days`,
      salaryRange: formatCurrency(deal.price),
      department: deal.destination,
      href: `/deals/${deal.slug}`,
      tags: [
        deal.is_featured ? 'Featured' : null,
        deal.original_price && deal.original_price > deal.price
          ? `${Math.round((1 - deal.price / deal.original_price) * 100)}% OFF`
          : null,
      ].filter(Boolean) as string[],
      deal: deal, // Pass the full deal object for bookmarking
    }));
  }, [deals]);

  // Apply search filter
  const filteredJobs = useMemo(() => {
    let result = allJobs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => {
          const pa = parseFloat(a.salaryRange.replace(/[^0-9.]/g, ''));
          const pb = parseFloat(b.salaryRange.replace(/[^0-9.]/g, ''));
          return pa - pb;
        });
        break;
      case 'price-high':
        result = [...result].sort((a, b) => {
          const pa = parseFloat(a.salaryRange.replace(/[^0-9.]/g, ''));
          const pb = parseFloat(b.salaryRange.replace(/[^0-9.]/g, ''));
          return pb - pa;
        });
        break;
      case 'featured':
        result = [...result].sort(
          (a, b) => (b.tags?.includes('Featured') ? 1 : 0) - (a.tags?.includes('Featured') ? 1 : 0)
        );
        break;
      case 'newest':
      default:
        // keep original order (API returns newest first)
        break;
    }

    return result;
  }, [allJobs, search, sortBy]);

  if (isLoading) {
    return <DealsPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
      </div>

      {/* Career3 layout with filtered data */}
      <Career3
        eyebrow="Explore our curated tour packages"
        heading="Tour Deals"
        subheading="Find your perfect getaway from our handpicked destinations"
        departments={departments}
        jobs={filteredJobs}
        exploreLabel="Build a custom package"
        exploreHref="/build-package"
        emptyMessage="No tours found matching your search. Try a different keyword."
      />
    </div>
  );
}
