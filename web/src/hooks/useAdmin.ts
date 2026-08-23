import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export function useAdminStats() {
  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
  });

  return {
    stats: statsQuery.data?.stats,
    recentBookings: statsQuery.data?.recentBookings || [],
    isLoading: statsQuery.isLoading,
  };
}

export function useAdminUsers(page = 1, search = '') {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => api.getAdminUsers(page, search),
  });

  return {
    users: usersQuery.data?.users || [],
    total: usersQuery.data?.total || 0,
    totalPages: usersQuery.data?.totalPages || 0,
    isLoading: usersQuery.isLoading,
  };
}

export function useAdminBookings(page = 1, status?: string, type?: string) {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', page, status, type],
    queryFn: () => api.getAdminBookings(page, status, type),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; admin_notes?: string } }) =>
      api.updateBookingStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Booking status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking');
    },
  });

  return {
    bookings: bookingsQuery.data?.bookings || [],
    total: bookingsQuery.data?.total || 0,
    totalPages: bookingsQuery.data?.totalPages || 0,
    isLoading: bookingsQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useAdminCustomPackages(page = 1) {
  const queryClient = useQueryClient();

  const packagesQuery = useQuery({
    queryKey: ['admin-custom-packages', page],
    queryFn: () => api.getAdminCustomPackages(page),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; admin_notes?: string; estimated_price?: number } }) =>
      api.updateCustomPackageStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-packages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Custom package status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update custom package');
    },
  });

  return {
    customPackages: packagesQuery.data?.customPackages || [],
    total: packagesQuery.data?.total || 0,
    totalPages: packagesQuery.data?.totalPages || 0,
    isLoading: packagesQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}
