import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function BudgetInput({ value, onChange }: BudgetInputProps) {
  return (
    <div>
      <Label htmlFor="budget">Budget (₹)</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
        <Input
          id="budget"
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Enter your budget"
          className="pl-8"
          min={0}
        />
      </div>
    </div>
  );
}
