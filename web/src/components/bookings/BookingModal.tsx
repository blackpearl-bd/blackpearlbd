import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { TourDeal } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: TourDeal;
}

export function BookingModal({ isOpen, onClose, deal }: BookingModalProps) {
  const { isAuthenticated } = useAuth();
  const { createBooking, isCreating } = useBookings();
  const [travelerDetails, setTravelerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    emergency_contact: '',
  });

  const handleConfirm = () => {
    if (!travelerDetails.name || !travelerDetails.email || !travelerDetails.phone) {
      return;
    }

    createBooking({
      booking_type: 'deal',
      deal_id: deal.id,
      total_amount: deal.price,
      traveler_details: travelerDetails,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-primary">{deal.title}</h4>
            <p className="text-sm text-slate-600">{deal.destination}</p>
            <p className="text-lg font-bold text-primary mt-2">
              {formatCurrency(deal.price)}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={travelerDetails.name}
                onChange={(e) =>
                  setTravelerDetails({ ...travelerDetails, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={travelerDetails.email}
                onChange={(e) =>
                  setTravelerDetails({ ...travelerDetails, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={travelerDetails.phone}
                onChange={(e) =>
                  setTravelerDetails({ ...travelerDetails, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={travelerDetails.emergency_contact}
                onChange={(e) =>
                  setTravelerDetails({
                    ...travelerDetails,
                    emergency_contact: e.target.value,
                  })
                }
                placeholder="Emergency contact (optional)"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCreating || !travelerDetails.name || !travelerDetails.email || !travelerDetails.phone}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
