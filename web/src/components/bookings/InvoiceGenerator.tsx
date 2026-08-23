import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useInvoice } from '@/hooks/useBookings';
import { Loader2 } from 'lucide-react';

interface InvoiceGeneratorProps {
  bookingId: string;
}

export function InvoiceGenerator({ bookingId }: InvoiceGeneratorProps) {
  const { downloadInvoice, isLoading } = useInvoice(bookingId);

  return (
    <Button variant="outline" size="sm" onClick={downloadInvoice} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-1" />
      )}
      Download Invoice
    </Button>
  );
}
