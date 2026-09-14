import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sun, MapPin, Utensils, Hotel, Camera, Compass, Star } from 'lucide-react';
import type { ItineraryDay } from '@/types';

interface DealTimelineProps {
  itinerary: ItineraryDay[];
}

const dayColors = [
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
  'from-fuchsia-500 to-magenta-500',
];

const dayIcons = [Sun, Camera, Compass, MapPin, Utensils, Hotel, Star, Compass];

function TimelineItem({ day, index }: { day: ItineraryDay; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;
  const colorClass = dayColors[index % dayColors.length];
  const Icon = dayIcons[index % dayIcons.length];

  return (
    <div ref={ref} className="relative flex items-start">
      {/* Desktop: alternating sides */}
      {/* Center line marker */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </motion.div>
      </div>

      {/* Mobile: left-aligned marker */}
      <div className="absolute left-0 z-10 md:hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} shadow-lg`}
        >
          <Icon className="h-4 w-4 text-white" />
        </motion.div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_4rem_1fr] md:gap-0 md:w-full md:items-start">
        {/* Left side content */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -40 : 0 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={isLeft ? '' : 'order-3'}
        >
          {isLeft ? (
            <DayCard day={day} index={index} colorClass={colorClass} align="right" />
          ) : (
            <div className="h-12" />
          )}
        </motion.div>

        {/* Center spacer */}
        <div className="order-2" />

        {/* Right side content */}
        <motion.div
          initial={{ opacity: 0, x: !isLeft ? 40 : 0 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={isLeft ? 'order-3' : ''}
        >
          {!isLeft ? (
            <DayCard day={day} index={index} colorClass={colorClass} align="left" />
          ) : (
            <div className="h-12" />
          )}
        </motion.div>
      </div>

      {/* Mobile layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="ml-14 md:hidden w-full pb-8"
      >
        <DayCard day={day} index={index} colorClass={colorClass} align="left" />
      </motion.div>
    </div>
  );
}

function DayCard({
  day,
  index,
  colorClass,
  align,
}: {
  day: ItineraryDay;
  index: number;
  colorClass: string;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      <div
        className={`inline-flex items-center gap-2 mb-2 rounded-full bg-gradient-to-r ${colorClass} px-3 py-1`}
      >
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Day {day.day}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-foreground mt-2">{day.title}</h4>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
        {day.description}
      </p>
    </div>
  );
}

export function DealTimeline({ itinerary }: DealTimelineProps) {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className="relative py-4">
      {/* Center vertical line (desktop) */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2" />

      {/* Left vertical line (mobile) */}
      <div className="md:hidden absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20" />

      <div className="space-y-8 md:space-y-12">
        {itinerary.map((day, index) => (
          <TimelineItem key={day.day} day={day} index={index} />
        ))}
      </div>
    </div>
  );
}
