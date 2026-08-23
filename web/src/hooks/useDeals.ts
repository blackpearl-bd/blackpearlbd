import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export function useDeals() {
  const queryClient = useQueryClient();

  const dealsQuery = useQuery({
    queryKey: ['deals'],
    queryFn: () => api.getDeals(),
  });

  return {
    deals: dealsQuery.data?.deals || [],
    isLoading: dealsQuery.isLoading,
  };
}

export function useDeal(slug: string) {
  const queryClient = useQueryClient();

  const dealQuery = useQuery({
    queryKey: ['deal', slug],
    queryFn: () => api.getDeal(slug),
    enabled: !!slug,
  });

  const saveDealMutation = useMutation({
    mutationFn: (dealId: string) => api.saveDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-deals'] });
      toast.success('Deal saved to bookmarks');
    },
    onError: () => {
      toast.error('Failed to save deal');
    },
  });

  const unsaveDealMutation = useMutation({
    mutationFn: (savedDealId: string) => api.unsaveDeal(savedDealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-deals'] });
      toast.success('Deal removed from bookmarks');
    },
    onError: () => {
      toast.error('Failed to remove deal');
    },
  });

  return {
    deal: dealQuery.data?.deal,
    isLoading: dealQuery.isLoading,
    saveDeal: saveDealMutation.mutate,
    unsaveDeal: unsaveDealMutation.mutate,
  };
}

export function useSavedDeals() {
  const savedDealsQuery = useQuery({
    queryKey: ['saved-deals'],
    queryFn: () => api.getSavedDeals(),
  });

  return {
    savedDeals: savedDealsQuery.data?.savedDeals || [],
    isLoading: savedDealsQuery.isLoading,
  };
}
