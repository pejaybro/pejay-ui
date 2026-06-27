import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/* ------------------------------------------------
 ? Types & Interfaces
 ------------------------------------------------*/

/**
 * Accepted inputs:
 * - `dayjs()`
 * - `new Date()`
 * - unix ms number
 * - `YYYY-MM-DD`
 * - `YYYY-MM-DDTHH:mm`
 * - `YYYY-MM-DDTHH:mm:ss`
 * - `YYYY-MM-DDTHH:mm:ss.SSS`
 * - the same ISO shapes with `Z` or `+05:30` / `-04:00`
 */
type ISODateInput = `${string}Z` | `${string}${"+" | "-"}${string}:${string}`;
type DateOnlyInput = `${number}-${number}-${number}`;
type LocalDateTimeInput =
  | `${number}-${number}-${number}T${number}:${number}`
  | `${number}-${number}-${number}T${number}:${number}:${number}`
  | `${number}-${number}-${number}T${number}:${number}:${number}.${number}`;

type DateInput =
  | Dayjs
  | Date
  | number
  | ISODateInput
  | DateOnlyInput
  | LocalDateTimeInput;

type FormatMode = "date" | "time" | "datetime";
type CompareUnit =
  | "timestamp"
  | "time"
  | "utc-time"
  | "day"
  | "week"
  | "month"
  | "year";

type CompareResult = {
  isSame: boolean;
  isBefore: boolean;
  isAfter: boolean;
};

/* ------------------------------------------------
 ? Config — browser timezone (auto-detected at runtime)
 ------------------------------------------------*/

const LOCAL_TZ = dayjs.tz.guess();

const ISO_WITH_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/;

function toLocalZone(date: Dayjs) {
  return date.tz(LOCAL_TZ);
}

/* ------------------------------------------------
 ? Input validation & parsing
 ------------------------------------------------*/

export function isValidDateInput(input: unknown): input is DateInput {
  if (input == null) return false;

  if (dayjs.isDayjs(input)) {
    return input.isValid();
  }

  if (input instanceof Date) {
    return !Number.isNaN(input.getTime());
  }

  if (typeof input === "number") {
    return Number.isFinite(input) && Number.isInteger(input);
  }

  if (typeof input === "string") {
    const value = input.trim();
    return (
      ISO_WITH_TIMEZONE.test(value) ||
      DATE_ONLY.test(value) ||
      LOCAL_DATE_TIME.test(value)
    );
  }

  return false;
}

/** Parse accepted input into dayjs, normalized to the browser's detected timezone. */
function parseToLocal(input: DateInput): Dayjs | null {
  if (!isValidDateInput(input)) return null;

  if (dayjs.isDayjs(input)) {
    return toLocalZone(input);
  }

  if (input instanceof Date) {
    return toLocalZone(dayjs(input));
  }

  if (typeof input === "number") {
    return toLocalZone(dayjs(input));
  }

  if (typeof input === "string") {
    const value = input.trim();

    if (ISO_WITH_TIMEZONE.test(value)) {
      const parsed = dayjs(value);
      return parsed.isValid() ? toLocalZone(parsed) : null;
    }

    if (DATE_ONLY.test(value)) {
      const parsed = dayjs(value, "YYYY-MM-DD", true);
      return parsed.isValid() ? toLocalZone(parsed) : null;
    }

    if (LOCAL_DATE_TIME.test(value)) {
      const parsed = dayjs(
        value,
        ["YYYY-MM-DDTHH:mm", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm:ss.SSS"],
        true,
      );
      return parsed.isValid() ? toLocalZone(parsed) : null;
    }
  }

  return null;
}

/* ------------------------------------------------
 ? Set date format
  @param input - dayjs() | new Date() | ISO+Z/offset | unix ms
  @param mode - Format mode (date, time, datetime)
  @param customformat - Custom format string
  @returns Formatted date string in the browser timezone
 ------------------------------------------------*/

export function setDateFormat({
  input,
  mode = "date",
  customformat,
}: {
  input: DateInput;
  mode?: FormatMode;
  customformat?: string;
}): string | null {
  const date = parseToLocal(input);
  if (!date) return null;

  const formats = {
    date: "DD/MM/YYYY",
    time: "hh:mm A",
    datetime: "DD/MM/YYYY hh:mm A",
  };

  return date.format(customformat ?? formats[mode]);
}

/* ------------------------------------------------
 ? Compare dates
  @param input - dayjs() | new Date() | ISO+Z/offset | unix ms
  @param compareTo - dayjs() | new Date() | ISO+Z/offset | unix ms
  @param mode - Comparison unit
  @returns
  {isSame: boolean;
  isBefore: boolean;
  isAfter: boolean;
  }
 ------------------------------------------------*/

export function compareDates({
  input,
  compareTo,
  mode,
}: {
  input: DateInput;
  compareTo: DateInput;
  mode: CompareUnit;
}): CompareResult | null {
  const left = parseToLocal(input);
  const right = parseToLocal(compareTo);

  if (!left || !right) {
    return null;
  }

  if (mode === "timestamp") {
    return {
      isSame: left.valueOf() === right.valueOf(),
      isBefore: left.valueOf() < right.valueOf(),
      isAfter: left.valueOf() > right.valueOf(),
    };
  }

  if (mode === "time") {
    const leftTime = getTimeValue(left);
    const rightTime = getTimeValue(right);

    return {
      isSame: leftTime === rightTime,
      isBefore: leftTime < rightTime,
      isAfter: leftTime > rightTime,
    };
  }

  if (mode === "utc-time") {
    const leftTime = getTimeValue(left.utc());
    const rightTime = getTimeValue(right.utc());

    return {
      isSame: leftTime === rightTime,
      isBefore: leftTime < rightTime,
      isAfter: leftTime > rightTime,
    };
  }

  return {
    isSame: left.isSame(right, mode),
    isBefore: left.isBefore(right, mode),
    isAfter: left.isAfter(right, mode),
  };
}

/* ------------------------------------------------
 ? Helper Functions
 ------------------------------------------------*/

export function getTimeValue(date: Dayjs): number {
  return (
    date.hour() * 3600000 +
    date.minute() * 60000 +
    date.second() * 1000 +
    date.millisecond()
  );
}

/*
 Accepted inputs only:
   dayjs()
   new Date()
  1718600000000
  "2026-06-17"
  "2026-06-17T10:30"
  "2026-06-17T10:30:00"
  "2026-06-17T10:30:00.123"
  "2026-06-17T10:30:00Z"
  "2026-06-17T10:30:00+05:30"


Timezone:
  - formatting and normal compare use dayjs.tz.guess() (browser/app timezone)
  - `time` compares local wall-clock time
  - `utc-time` compares UTC clock time

 ? Example Usage

   setDateFormat({ input: dayjs() });
   setDateFormat({ input: new Date(), mode: "datetime" });
  setDateFormat({ input: "2026-06-17", mode: "date" });
  setDateFormat({ input: "2026-06-17T10:30", mode: "datetime" });
   setDateFormat({ input: "2026-06-17T10:30:00Z", mode: "time" });
   setDateFormat({ input: 1718600000000, mode: "date" });

   compareDates({
     input: "2026-06-17T10:30:00Z",
     compareTo: new Date(),
     mode: "day",
   });

   compareDates({
     input: "2026-06-17T10:30:00+05:30",
     compareTo: "2026-06-17T10:30:00Z",
     mode: "timestamp",
   });

  compareDates({
    input: "2026-06-17T10:30:00Z",
    compareTo: "2026-06-17T08:30:00Z",
    mode: "utc-time",
  });

  // `time` compares local clock time after timezone conversion
  compareDates({
    input: "2026-06-17T10:30:00Z",
    compareTo: "2026-06-17T10:30:00+05:30",
    mode: "time",
  });

  // `utc-time` compares the UTC clock time directly
  compareDates({
    input: "2026-06-17T10:30:00Z",
    compareTo: "2026-06-17T10:30:00+05:30",
    mode: "utc-time",
  });
*/
