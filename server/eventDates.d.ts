export declare const HOUSTON_TZ: "America/Chicago";

export declare function houstonDateKey(date: Date | string): string | null;

export declare function hasValidEventDate(rawDate: unknown): rawDate is string;

export declare function isUpcomingEvent(
  event: { rawDate: string | null } | null | undefined,
  now?: Date,
): boolean;

export declare function withComputedStatus<T extends { rawDate: string | null }>(
  events: T[],
  now?: Date,
): Array<T & { status: "upcoming" | "past" }>;

export declare function buildEventDate(
  monthName: string,
  day: string | number,
  year?: string | number | null,
  now?: Date,
): Date | null;
