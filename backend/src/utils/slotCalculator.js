function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function computeAvailableSlots({ availabilities, bookedAppointments, slotDurationMinutes }) {
  const busyRanges = bookedAppointments.map((b) => ({
    start: toMinutes(b.startTime),
    end: toMinutes(b.endTime),
  }));

  const slots = [];

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

module.exports = { computeAvailableSlots, toMinutes, toHHMM, rangesOverlap };
