import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTierColor(status: string) {
  switch (status) {
    case 'diamond': return 'bg-pearl-diamond text-slate-900';
    case 'gold': return 'bg-pearl-gold text-slate-900';
    case 'platinum': return 'bg-pearl-platinum text-slate-900';
    case 'bronze': return 'bg-pearl-bronze text-white';
    default: return 'bg-slate-300 text-slate-700';
  }
}

export function getTierProgress(pearls: number) {
  if (pearls >= 200) return { current: 'Diamond', next: null, progress: 100, needed: 0 };
  if (pearls >= 100) return { current: 'Gold', next: 'Diamond', progress: ((pearls - 100) / 100) * 100, needed: 200 - pearls };
  if (pearls >= 50) return { current: 'Platinum', next: 'Gold', progress: ((pearls - 50) / 50) * 100, needed: 100 - pearls };
  if (pearls >= 10) return { current: 'Bronze', next: 'Platinum', progress: ((pearls - 10) / 40) * 100, needed: 50 - pearls };
  return { current: 'New', next: 'Bronze', progress: (pearls / 10) * 100, needed: 10 - pearls };
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-700';
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'rejected': return 'bg-rose-100 text-rose-700';
    case 'cancelled': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}
