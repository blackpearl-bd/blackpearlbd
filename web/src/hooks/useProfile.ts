import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export function useProfile() {
  const queryClient = useQueryClient();
  const { setProfile } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { profile } = await api.getProfile();
      setProfile(profile);
      return profile;
    },
  });

  const statsQuery = useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => api.getProfileStats(),
  });

  const toursQuery = useQuery({
    queryKey: ['profile-tours'],
    queryFn: () => api.getProfileTours(),
  });

  const pendingQuery = useQuery({
    queryKey: ['profile-pending'],
    queryFn: () => api.getProfilePending(),
  });

  const pearlsQuery = useQuery({
    queryKey: ['profile-pearls'],
    queryFn: () => api.getProfilePearls(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { full_name?: string; phone?: string; address?: string }) =>
      api.updateProfile(data),
    onSuccess: (data) => {
      setProfile(data.profile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  return {
    profile: profileQuery.data,
    stats: statsQuery.data,
    tours: toursQuery.data?.tours || [],
    pendingBookings: pendingQuery.data?.bookings || [],
    pearlsHistory: pearlsQuery.data?.history || [],
    isLoading: profileQuery.isLoading || statsQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}
