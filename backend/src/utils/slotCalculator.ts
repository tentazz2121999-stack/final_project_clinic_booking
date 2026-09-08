export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function computeAvailableSlots({
  availabilities,
  bookedAppointments,
  slotDurationMinutes,
}: {
  availabilities: TimeRange[];
  bookedAppointments: TimeRange[];
  slotDurationMinutes: number;
}): Slot[] {
  const busyRanges = bookedAppointments.map((b) => ({
    start: toMinutes(b.startTime),
    end: toMinutes(b.endTime),
  }));

  const slots: Slot[] = [];

  for (const window of availabilities) {
    const windowStart = toMinutes(window.startTime);
    const windowEnd = toMinutes(window.endTime);

    for (let start = windowStart; start + slotDurationMinutes <= windowEnd; start += slotDurationMinutes) {
      const end = start + slotDurationMinutes;
      const isBusy = busyRanges.some((r) => rangesOverlap(start, end, r.start, r.end));
      if (!isBusy) {
        slots.push({ startTime: toHHMM(start), endTime: toHHMM(end) });
      }
    }
  }

  return slots;
}
