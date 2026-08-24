import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface PackageSummaryProps {
  destination: string | null;
  travelDate: string;
  numTravelers: number;
  accommodationType: string;
  transportType: string;
  budget: number;
  activities: string[];
  specialRequests: string;
}

export function PackageSummary({
  destination,
  travelDate,
  numTravelers,
  accommodationType,
  transportType,
  budget,
  activities,
  specialRequests,
}: PackageSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Destination</span>
          <span className="font-medium">{destination || 'Not selected'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Travel Date</span>
          <span className="font-medium">{travelDate || 'Not selected'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Travelers</span>
          <span className="font-medium">{numTravelers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Accommodation</span>
          <span className="font-medium capitalize">{accommodationType || 'Not selected'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transport</span>
          <span className="font-medium capitalize">{transportType || 'Not selected'}</span>
        </div>
        {activities.length > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Activities</span>
            <span className="font-medium">{activities.length} selected</span>
          </div>
        )}
        {specialRequests && (
          <div className="pt-2 border-t">
            <span className="text-muted-foreground text-sm">Special Requests:</span>
            <p className="text-sm mt-1">{specialRequests}</p>
          </div>
        )}
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Budget</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(budget)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
