import {
    addDays,
    addHours,
    format,
    nextMonday,
    setHours,
    setMinutes,
    startOfDay,
  } from 'date-fns';
  


export function getTodayWindow() {
  const start = startOfDay(new Date());
  return {
    dayStart: start.toISOString(),
    dayEnd: addDays(start, 1).toISOString(),
  };
}


export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));

  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'year'],
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24 * 7, 'week'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];

  for (const [size, label] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${label}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}


export const formatDateTime = (iso: string) => format(new Date(iso), 'MMM d, h:mm a');


export const formatTime = (iso: string) => format(new Date(iso), 'h:mm a');


export const todayInputValue = () => format(new Date(), 'yyyy-MM-dd');


export function parseLocalDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}


export function followUpPresets(now: Date = new Date()) {
    const parts = (d: Date) => ({ date: format(d, 'yyyy-MM-dd'), time: format(d, 'HH:mm') });
    const at10 = (d: Date) => setMinutes(setHours(d, 10), 0);
  
    return [
      { label: 'In 1 hour', ...parts(addHours(now, 1)) },
      { label: 'Tomorrow 10 AM', ...parts(at10(addDays(now, 1))) },
      { label: 'In 3 days', ...parts(at10(addDays(now, 3))) },
      { label: 'Next week', ...parts(at10(nextMonday(now))) },
    ];
  }