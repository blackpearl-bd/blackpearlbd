import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Combobox, ComboboxTrigger, ComboboxValue, ComboboxContent, ComboboxInput, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxGroup, ComboboxSeparator } from '@/components/ui/combobox';
import { WheelPicker } from '@/components/ui/wheel-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PackageSummary } from './PackageSummary';
import { useGeoLocation, formatDateInTimezone } from '@/hooks/useGeoLocation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BANGLADESH_DIVISIONS, type Division, type District, type TourSpot } from '@/data/bangladesh-tourist-spots';

// ── SVG Icons ────────────────────────────────────────────────────────
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
);

const CheckSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Destination data (from CSV: Column A = category/region, Column B = destination under that category) ──


type DestinationItem = {
  value: string;          // slug for combobox selection
  name: string;           // display name (Column B)
};

type CategoryGroup = {
  category: string;       // Column A (group header)
  items: DestinationItem[];
};

// Build Bangladesh division items from the data file
const bangladeshDivisionItems: DestinationItem[] = [
  { value: 'bangladesh-customized', name: 'Bangladesh (Customized)' },
  ...BANGLADESH_DIVISIONS.map((d) => ({
    value: d.name.toLowerCase().replace(/\s+/g, '-'),
    name: d.name,
  })),
];

const DESTINATION_GROUPS: CategoryGroup[] = [
  {
    category: 'Bangladesh',
    items: bangladeshDivisionItems,
  },
  {
    category: 'Asia',
    items: [
      { value: 'thailand', name: 'Thailand' },
      { value: 'malaysia', name: 'Malaysia' },
      { value: 'indonesia', name: 'Indonesia' },
      { value: 'united-arab-emirates', name: 'United Arab Emirates' },
      { value: 'maldives', name: 'Maldives' },
      { value: 'nepal', name: 'Nepal' },
      { value: 'japan', name: 'Japan' },
    ],
  },
  {
    category: 'Asia / Europe',
    items: [
      { value: 'turkey', name: 'Turkey' },
    ],
  },
  {
    category: 'Europe',
    items: [
      { value: 'switzerland', name: 'Switzerland' },
      { value: 'france', name: 'France' },
    ],
  },
];

/** Determine if a destination value is a Bangladesh customization option */
function isBangladeshDestination(value: string): boolean {
  return value === 'bangladesh-customized' || value.endsWith('-division');
}

/** Get the Division object for a selected value */
function getDivisionForValue(value: string): Division | undefined {
  return BANGLADESH_DIVISIONS.find(
    (d) => d.name.toLowerCase().replace(/\s+/g, '-') === value,
  );
}

/** Find a destination item by its slug value across all groups. */
function findDestination(value: string): (DestinationItem & { group: string }) | undefined {
  for (const group of DESTINATION_GROUPS) {
    const item = group.items.find((i) => i.value === value);
    if (item) return { ...item, group: group.category };
  }
  return undefined;
}

// ── Date helpers ─────────────────────────────────────────────────────
const MONTHS = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function generateDayOptions(year: number, month: number) {
  const days = getDaysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1).padStart(2, '0'),
  }));
}

function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => ({
    label: String(currentYear + i),
    value: String(currentYear + i),
  }));
}

function formatDateDisplay(month: string, day: string, year: string) {
  const m = MONTHS.find((mo) => mo.value === month);
  return `${m?.label ?? month} ${parseInt(day)}, ${year}`;
}

// ── DatePicker button + popover ──────────────────────────────────────
function DatePickerPopover({
  label,
  month,
  day,
  year,
  onMonthChange,
  onDayChange,
  onYearChange,
  minYear,
  timezone,
}: {
  label: string;
  month: string;
  day: string;
  year: string;
  onMonthChange: (v: string) => void;
  onDayChange: (v: string) => void;
  onYearChange: (v: string) => void;
  minYear?: number;
  timezone?: string;
}) {
  // Compute GMT label, e.g. "GMT+6"
  const tzLabel = useMemo(() => {
    if (!timezone) return null;
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      })
        .formatToParts(new Date())
        .filter((p) => p.type === 'timeZoneName');
      return parts[0]?.value ?? null;
    } catch {
      return null;
    }
  }, [timezone]);
  const yearOptions = useMemo(() => {
    const all = generateYearOptions();
    return minYear ? all.filter((o) => Number(o.value) >= minYear) : all;
  }, [minYear]);

  const dayOptions = useMemo(
    () => generateDayOptions(Number(year), Number(month)),
    [year, month],
  );

  // Clamp day if it exceeds the new month's max
  const currentDay = useMemo(() => {
    const maxDay = getDaysInMonth(Number(year), Number(month));
    const d = Number(day);
    return d > maxDay ? String(maxDay).padStart(2, '0') : day;
  }, [year, month, day]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center gap-2 overflow-hidden rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-foreground/20',
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {month && day && year
              ? formatDateDisplay(month, currentDay, year)
              : label}
          </span>
          {tzLabel && (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground font-medium">
              {tzLabel}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-auto p-3">
        <div className="flex gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">Month</span>
            <WheelPicker
              options={MONTHS}
              value={month}
              onValueChange={onMonthChange}
              visibleCount={5}
              itemHeight={36}
              sound
              className="h-[180px] w-[120px]"
              aria-label="Select month"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">Day</span>
            <WheelPicker
              options={dayOptions}
              value={currentDay}
              onValueChange={onDayChange}
              visibleCount={5}
              itemHeight={36}
              sound
              className="h-[180px] w-[80px]"
              aria-label="Select day"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">Year</span>
            <WheelPicker
              options={yearOptions}
              value={year}
              onValueChange={onYearChange}
              visibleCount={5}
              itemHeight={36}
              sound
              className="h-[180px] w-[100px]"
              aria-label="Select year"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Step labels ──────────────────────────────────────────────────────
const STEP_LABELS = [
  { title: 'Destination & Dates', description: 'Where and when do you want to travel?' },
  { title: 'Preferences', description: 'Customize your travel experience' },
  { title: 'Review', description: 'Review and submit your package' },
];

// ── SessionStorage persistence ─────────────────────────────────────
const STORAGE_KEY = 'build-package-form';

type SavedState = {
  step: number;
  destination: string;
  fromMonth: string;
  fromDay: string;
  fromYear: string;
  toMonth: string;
  toDay: string;
  toYear: string;
};

function loadSavedState(): SavedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

// ── Main Component ───────────────────────────────────────────────────
export default function BuildPackage() {
  const saved = useMemo(() => loadSavedState(), []);
  const geo = useGeoLocation();

  // Date defaults – today / tomorrow, resolved in the visitor's timezone
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  // Get today's date parts in the visitor's timezone
  const todayInTz = useMemo(() => {
    try {
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: geo.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const parts = fmt.formatToParts(today);
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      return { month: get('month'), day: get('day'), year: get('year') };
    } catch {
      return {
        month: pad(today.getMonth() + 1),
        day: pad(today.getDate()),
        year: String(today.getFullYear()),
      };
    }
  }, [geo.timezone, today]);

  const tomorrowInTz = useMemo(() => {
    try {
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: geo.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const parts = fmt.formatToParts(tomorrow);
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      return { month: get('month'), day: get('day'), year: get('year') };
    } catch {
      return {
        month: pad(tomorrow.getMonth() + 1),
        day: pad(tomorrow.getDate()),
        year: String(tomorrow.getFullYear()),
      };
    }
  }, [geo.timezone, tomorrow]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const [step, setStep] = useState(saved?.step ?? 1);
  const [destination, setDestination] = useState(saved?.destination ?? '');
  const [isLoading, setIsLoading] = useState(false);

  // Bangladesh customization state
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedTourSpots, setSelectedTourSpots] = useState<string[]>([]);

  // Reset BD sub-selections when destination changes
  useEffect(() => {
    if (!isBangladeshDestination(destination)) {
      setSelectedDivision('');
      setSelectedDistrict('');
      setSelectedTourSpots([]);
    } else if (destination !== 'bangladesh-customized') {
      // A specific division was selected directly — sync it
      const div = getDivisionForValue(destination);
      setSelectedDivision(div?.name ?? '');
      setSelectedDistrict('');
      setSelectedTourSpots([]);
    } else {
      // 'bangladesh-customized' selected — reset sub-selections
      setSelectedDivision('');
      setSelectedDistrict('');
      setSelectedTourSpots([]);
    }
  }, [destination]);

  const currentDivision = useMemo(() => {
    if (!selectedDivision) return undefined;
    return BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision);
  }, [selectedDivision]);

  const currentDistrict = useMemo(() => {
    if (!currentDivision || !selectedDistrict) return undefined;
    return currentDivision.districts.find((d) => d.name === selectedDistrict);
  }, [currentDivision, selectedDistrict]);

  const handleDivisionChange = (divisionName: string) => {
    setSelectedDivision(divisionName);
    setSelectedDistrict('');
    setSelectedTourSpots([]);
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedTourSpots([]);
  };

  const toggleTourSpot = (spotName: string) => {
    setSelectedTourSpots((prev) =>
      prev.includes(spotName)
        ? prev.filter((s) => s !== spotName)
        : [...prev, spotName],
    );
  };

  const [fromMonth, setFromMonth] = useState(saved?.fromMonth ?? todayInTz.month);
  const [fromDay, setFromDay] = useState(saved?.fromDay ?? todayInTz.day);
  const [fromYear, setFromYear] = useState(saved?.fromYear ?? todayInTz.year);

  const [toMonth, setToMonth] = useState(saved?.toMonth ?? tomorrowInTz.month);
  const [toDay, setToDay] = useState(saved?.toDay ?? tomorrowInTz.day);
  const [toYear, setToYear] = useState(saved?.toYear ?? tomorrowInTz.year);

  // Persist to sessionStorage on every relevant change
  useEffect(() => {
    const state: SavedState = { step, destination, fromMonth, fromDay, fromYear, toMonth, toDay, toYear };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota exceeded – silently ignore
    }
  }, [step, destination, fromMonth, fromDay, fromYear, toMonth, toDay, toYear]);

  const canNext = useMemo(() => {
    if (step === 1) {
      if (!destination || !fromMonth || !fromDay || !fromYear || !toMonth || !toDay || !toYear) return false;
      // If Bangladesh destination, require district selection
      if (isBangladeshDestination(destination)) {
        return !!selectedDistrict;
      }
    }
    return true;
  }, [step, destination, fromMonth, fromDay, fromYear, toMonth, toDay, toYear, selectedDistrict]);

  const handleNext = useCallback(() => {
    if (step < 3 && canNext) setStep(step + 1);
  }, [step, canNext]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    },
    [],
  );

  // Ensure "To" date is not before "From" date
  const fromDate = new Date(Number(fromYear), Number(fromMonth) - 1, Number(fromDay));
  const toDate = new Date(Number(toYear), Number(toMonth) - 1, Number(toDay));
  const toMinYear = Number(fromYear);

  // If to-date < from-date, auto-adjust to-date = from-date
  const effectiveToMonth = toDate < fromDate ? fromMonth : toMonth;
  const effectiveToDay = toDate < fromDate ? fromDay : toDay;
  const effectiveToYear = toDate < fromDate ? fromYear : toYear;

  // Build combined travel date string for the sidebar
  const travelDateDisplay = geo.loaded
    ? formatDateInTimezone(fromMonth, fromDay, fromYear, geo.timezone)
    : formatDateDisplay(fromMonth, fromDay, fromYear);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left column: form ── */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-foreground">
                Step {step} of 3
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((step / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={false}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-lg shadow-sm p-6 min-w-0"
          >
          {/* Header */}
          <div className="relative text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
              <MapPin className="h-5 w-5 text-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Build Your Package
            </h1>
            <p className="text-sm text-muted-foreground">
              {STEP_LABELS[step - 1].description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Destination & Dates ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Destination Combobox */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Destination
                    </label>
                    <Combobox value={destination} onValueChange={setDestination}>
                      <ComboboxTrigger>
                        <ComboboxValue placeholder="Select destination" />
                      </ComboboxTrigger>
                      <ComboboxContent className="w-[380px]">
                        <ComboboxInput placeholder="Search destinations..." />
                        <ComboboxList className="max-h-[400px]">
                          <ComboboxEmpty>No destination found.</ComboboxEmpty>
                          {DESTINATION_GROUPS.map((group, groupIndex) => (
                            <React.Fragment key={group.category}>
                              {groupIndex > 0 ? <ComboboxSeparator /> : null}
                              <ComboboxGroup>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                  {group.category}
                                </div>
                                {group.items.map((item) => (
                                  <ComboboxItem
                                    key={item.value}
                                    value={item.value}
                                    textValue={item.name}
                                    keywords={[group.category, item.name]}
                                    className="py-2"
                                  >
                                    <span className="flex min-w-0 items-center gap-2.5">
                                      <span className="min-w-0">
                                        <span className="block truncate font-medium text-foreground">
                                          {item.name}
                                        </span>
                                      </span>
                                    </span>
                                  </ComboboxItem>
                                ))}
                              </ComboboxGroup>
                            </React.Fragment>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  {/* ── Destination Preview ── */}
                  {destination && (() => {
                    const dest = findDestination(destination);
                    if (!dest) return null;
                    return (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-lg border border-border bg-muted/50 overflow-hidden"
                      >
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-foreground mb-1">
                            {dest.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {dest.group}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* ── Bangladesh Customization: Division → District → Tour Spots ── */}
                  {isBangladeshDestination(destination) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-lg border border-border bg-muted/50 overflow-hidden space-y-4"
                    >
                      <div className="p-4 space-y-4">
                        {/* Division select (only when "Customized" is chosen) */}
                        {destination === 'bangladesh-customized' && (
                          <div>
                            <Label className="text-sm font-medium text-foreground">Division</Label>
                            <Select
                              value={selectedDivision}
                              onValueChange={handleDivisionChange}
                            >
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select a division" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANGLADESH_DIVISIONS.map((div) => (
                                  <SelectItem key={div.name} value={div.name}>
                                    {div.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* District select (cascading from division) */}
                        {currentDivision && (
                          <div>
                            <Label className="text-sm font-medium text-foreground">District</Label>
                            <Select
                              value={selectedDistrict}
                              onValueChange={handleDistrictChange}
                            >
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select a district" />
                              </SelectTrigger>
                              <SelectContent>
                                {currentDivision.districts.map((dist) => (
                                  <SelectItem key={dist.name} value={dist.name}>
                                    {dist.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Tour spots checkboxes (cascading from district) */}
                        {currentDistrict && (
                          <div>
                            <Label className="text-sm font-medium text-foreground">
                              Tour Spots{' '}
                              <span className="text-muted-foreground font-normal">
                                ({selectedTourSpots.length} selected)
                              </span>
                            </Label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {currentDistrict.tourSpots.map((spot) => (
                                <label
                                  key={spot.name}
                                  className={cn(
                                    'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                                    selectedTourSpots.includes(spot.name)
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border bg-card hover:bg-accent/50',
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedTourSpots.includes(spot.name)}
                                    onChange={() => toggleTourSpot(spot.name)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                                  />
                                  <span className="text-sm text-foreground">
                                    {spot.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* From Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      From
                    </label>
                    <DatePickerPopover
                      label="Select start date"
                      month={fromMonth}
                      day={fromDay}
                      year={fromYear}
                      onMonthChange={setFromMonth}
                      onDayChange={setFromDay}
                      onYearChange={setFromYear}
                      timezone={geo.timezone}
                    />
                  </div>

                  {/* To Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      To
                    </label>
                    <DatePickerPopover
                      label="Select end date"
                      month={effectiveToMonth}
                      day={effectiveToDay}
                      year={effectiveToYear}
                      onMonthChange={setToMonth}
                      onDayChange={setToDay}
                      onYearChange={setToYear}
                      minYear={toMinYear}
                      timezone={geo.timezone}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    className="w-full"
                  >
                    Next Step
                    <ArrowRightIcon />
                  </Button>
                </motion.div>
              )}

              {/* ── Step 2: Preferences (placeholder) ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>Step 2 — Preferences</p>
                    <p className="mt-1">Coming soon...</p>
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full">
                    Next Step
                    <ArrowRightIcon />
                  </Button>
                </motion.div>
              )}

              {/* ── Step 3: Review (placeholder) ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Review summary */}
                  <div className="bg-muted border border-border p-4 rounded-md">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <CheckSvg />
                      Review Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Destination:</span>
                        <span className="text-foreground font-medium">
                          {destination === 'bangladesh-customized'
                            ? 'Bangladesh (Customized)'
                            : findDestination(destination)?.name ?? '—'}
                        </span>
                      </div>
                      {isBangladeshDestination(destination) && selectedDivision && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Division:</span>
                          <span className="text-foreground font-medium">{selectedDivision}</span>
                        </div>
                      )}
                      {isBangladeshDestination(destination) && selectedDistrict && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">District:</span>
                          <span className="text-foreground font-medium">{selectedDistrict}</span>
                        </div>
                      )}
                      {isBangladeshDestination(destination) && selectedTourSpots.length > 0 && (
                        <div className="py-1">
                          <span className="text-muted-foreground">Tour Spots:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {selectedTourSpots.map((spot) => (
                              <span
                                key={spot}
                                className="inline-block rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium"
                              >
                                {spot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">From:</span>
                        <span className="text-foreground font-medium">
                          {formatDateDisplay(fromMonth, fromDay, fromYear)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">To:</span>
                        <span className="text-foreground font-medium">
                          {formatDateDisplay(effectiveToMonth, effectiveToDay, effectiveToYear)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit Package'
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Back Button */}
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-4 w-full text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon />
              Back to previous step
            </button>
          )}
          </motion.div>
        </div>

        {/* ── Right column: summary sidebar ── */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <PackageSummary
              destination={findDestination(destination)?.name ?? null}
              travelDate={travelDateDisplay}
              numTravelers={1}
              accommodationType=""
              transportType=""
              budget={0}
              activities={[]}
              specialRequests=""
              currencyCode={geo.currency}
              locale={geo.locale}
              timezone={geo.timezone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
