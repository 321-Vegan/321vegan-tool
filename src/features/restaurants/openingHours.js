import { DAYS } from "./restaurantConstants";

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (hhmm) => {
  const [hours, minutes] = hhmm.split(":");
  return Number(hours) * 60 + Number(minutes);
};

/**
 * What is wrong with the schedule, in words, or null. Same rules as the API:
 * valid times, a slot can't open and close at the same time, and slots may
 * not overlap, including one running past midnight (close < open).
 * */
export function openingHoursError(slots) {
  if (!slots?.length) return null;
  for (const slot of slots) {
    if (!TIME_PATTERN.test(slot.open) || !TIME_PATTERN.test(slot.close)) {
      return `${DAYS[slot.day]} : heure manquante ou invalide`;
    }
    if (slot.open === slot.close) {
      return `${DAYS[slot.day]} : un créneau ne peut pas ouvrir et fermer à la même heure`;
    }
  }
  const intervals = slots
    .map((slot) => {
      const start = slot.day * MINUTES_PER_DAY + toMinutes(slot.open);
      const duration =
        (toMinutes(slot.close) - toMinutes(slot.open) + MINUTES_PER_DAY) %
        MINUTES_PER_DAY;
      return { slot, start, end: start + duration };
    })
    .sort((a, b) => a.start - b.start);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].start < intervals[i - 1].end) {
      return `${DAYS[intervals[i].slot.day]} : des créneaux se chevauchent`;
    }
  }
  // A sunday slot running past midnight must not overlap monday's first one
  const last = intervals.at(-1);
  if (last.end - MINUTES_PER_WEEK > intervals[0].start) {
    return `${DAYS[last.slot.day]} : le créneau déborde sur le ${DAYS[0].toLowerCase()}`;
  }
  return null;
}

/** The slots in week order (monday first, then by opening time). */
export const sortSlots = (slots) =>
  [...slots].sort(
    (a, b) =>
      a.day * MINUTES_PER_DAY +
      toMinutes(a.open) -
      (b.day * MINUTES_PER_DAY + toMinutes(b.open)),
  );

/** A food truck stop's name: its label, else its address, else its city. */
export const stopTitle = (stop) =>
  stop.label || stop.address || stop.city || "Emplacement";

/** "Mar 11:30–14:00 · Jeu 11:30–14:00", or "Jours variables". */
export function stopDaysText(slots) {
  if (!slots?.length) return "Jours variables";
  return DAYS.map((day, index) => {
    const times = sortSlots(slots.filter((slot) => slot.day === index)).map(
      (slot) => `${slot.open}–${slot.close}`,
    );
    return times.length ? `${day.slice(0, 3)} ${times.join(", ")}` : null;
  })
    .filter(Boolean)
    .join(" · ");
}

// As many as the API takes
export const MAX_STOPS = 14;

/**
 * The stop with a key of its own, for the form only (the maps are not
 * re-centered when the stops are reordered): `withoutKey` before sending.
 * */
export const withKey = (stop) => ({ ...stop, _key: crypto.randomUUID() });
// eslint-disable-next-line no-unused-vars
export const withoutKey = ({ _key, ...stop }) => stop;
