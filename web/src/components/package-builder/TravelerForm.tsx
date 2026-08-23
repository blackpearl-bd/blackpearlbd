import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TravelerFormProps {
  numTravelers: number;
  accommodationType: string;
  transportType: string;
  onNumTravelersChange: (value: number) => void;
  onAccommodationTypeChange: (value: string) => void;
  onTransportTypeChange: (value: string) => void;
}

export function TravelerForm({
  numTravelers,
  accommodationType,
  transportType,
  onNumTravelersChange,
  onAccommodationTypeChange,
  onTransportTypeChange,
}: TravelerFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="numTravelers">Number of Travelers</Label>
        <Input
          id="numTravelers"
          type="number"
          value={numTravelers}
          onChange={(e) => onNumTravelersChange(Number(e.target.value))}
          min={1}
          max={50}
        />
      </div>

      <div>
        <Label>Accommodation Type</Label>
        <Select value={accommodationType} onValueChange={onAccommodationTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select accommodation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Transport Type</Label>
        <Select value={transportType} onValueChange={onTransportTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select transport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flight">Flight</SelectItem>
            <SelectItem value="bus">Bus</SelectItem>
            <SelectItem value="train">Train</SelectItem>
            <SelectItem value="self">Self</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
