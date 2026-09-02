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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { full_name?: string; role?: string; status?: string; pearls?: number } }) =>
      api.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  return {
    users: usersQuery.data?.users || [],
    total: usersQuery.data?.total || 0,
    totalPages: usersQuery.data?.totalPages || 0,
    isLoading: usersQuery.isLoading,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
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

export function usePackageDestinations() {
  const queryClient = useQueryClient();

  const destinationsQuery = useQuery({
    queryKey: ['admin-package-destinations'],
    queryFn: () => api.getAdminPackageDestinations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { category: string; name: string; value: string; sort_order?: number; is_active?: boolean }) =>
      api.createPackageDestination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package-destinations'] });
      toast.success('Destination added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add destination');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { category?: string; name?: string; value?: string; sort_order?: number; is_active?: boolean } }) =>
      api.updatePackageDestination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package-destinations'] });
      toast.success('Destination updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update destination');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePackageDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package-destinations'] });
      toast.success('Destination deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete destination');
    },
  });

  return {
    destinations: destinationsQuery.data?.destinations || [],
    isLoading: destinationsQuery.isLoading,
    createDestination: createMutation.mutate,
    updateDestination: updateMutation.mutate,
    deleteDestination: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
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
