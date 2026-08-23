import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { generateInvoicePDF } from '../lib/pdf-generator';
import toast from 'react-hot-toast';

export function useBookings() {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.getBookings(),
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: {
      booking_type: string;
      deal_id?: string;
      custom_package_id?: string;
      total_amount: number;
      traveler_details: Record<string, unknown>;
    }) => api.createBooking(data as any),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Generate PDF
      generateInvoicePDF(data.booking);
      
      toast.success('Booking request submitted! Invoice downloaded.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });

  return {
    bookings: bookingsQuery.data?.bookings || [],
    isLoading: bookingsQuery.isLoading,
    createBooking: createBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
  };
}

export function useInvoice(bookingId: string) {
  const invoiceQuery = useQuery({
    queryKey: ['invoice', bookingId],
    queryFn: () => api.getInvoice(bookingId),
    enabled: !!bookingId,
  });

  const downloadInvoice = async () => {
    if (invoiceQuery.data?.invoice) {
      generateInvoicePDF(invoiceQuery.data.invoice);
      toast.success('Invoice downloaded');
    }
  };

  return {
    invoice: invoiceQuery.data?.invoice,
    isLoading: invoiceQuery.isLoading,
    downloadInvoice,
  };
}
