export type DateInput =
  | Date
  | {
      year: number;
      month: number; // 1-12
      day: number; // 1-31
      hour?: number;
      minute?: number;
      second?: number;
    };

export type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateParts(input: DateInput): DateParts {
  if (input instanceof Date) {
    return {
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
      hour: input.getHours(),
      minute: input.getMinutes(),
      second: input.getSeconds(),
    };
  }

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour ?? 0,
    minute: input.minute ?? 0,
    second: input.second ?? 0,
  };
}

export function toUtcMs(parts: DateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);
}

export function fromUtcMs(ms: number): DateParts {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
  };
}

export function addDays(parts: DateParts, days: number): DateParts {
  return fromUtcMs(toUtcMs(parts) + days * DAY_MS);
}

export function diffDays(a: DateParts, b: DateParts): number {
  return Math.floor((toUtcMs(a) - toUtcMs(b)) / DAY_MS);
}

function isoWeekdayFromMidnightUtcMs(midnightUtcMs: number): number {
  const day = new Date(midnightUtcMs).getUTCDay(); // 0..6 (Sun..Sat)
  return day === 0 ? 7 : day; // 1..7 (Mon..Sun)
}

export function getIsoWeekInfo(parts: Pick<DateParts, "year" | "month" | "day">): { isoYear: number; isoWeek: number; isoWeekday: number } {
  const midnight = Date.UTC(parts.year, parts.month - 1, parts.day);
  const isoWeekday = isoWeekdayFromMidnightUtcMs(midnight);
  const currentThursday = midnight + (4 - isoWeekday) * DAY_MS;
  const isoYear = new Date(currentThursday).getUTCFullYear();
  const jan4 = Date.UTC(isoYear, 0, 4);
  const jan4Weekday = isoWeekdayFromMidnightUtcMs(jan4);
  const firstThursday = jan4 + (4 - jan4Weekday) * DAY_MS;
  const isoWeek = 1 + Math.floor((currentThursday - firstThursday) / (7 * DAY_MS));
  return { isoYear, isoWeek, isoWeekday };
}

export function getWeekdayIndexMonday0(parts: Pick<DateParts, "year" | "month" | "day">): number {
  return getIsoWeekInfo(parts).isoWeekday - 1; // 0..6
}
