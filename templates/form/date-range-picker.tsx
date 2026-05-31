import React, { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { SelectInput } from "../select-dropdown/select-input";
const DateUtils = {};
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

type StaticPresetId =
  | "yesterday"
  | "today"
  | "tomorrow"
  | "last-week"
  | "this-week"
  | "next-week"
  | "last-month"
  | "this-month"
  | "next-month"
  | "last-year"
  | "this-year"
  | "next-year";

type DynamicPresetId =
  | `last-${number}-weeks`
  | `last-${number}-months`
  | `last-${number}-years`
  | `next-${number}-weeks`
  | `next-${number}-months`
  | `next-${number}-years`;

/**
 * Available static and dynamic presets for the DateRangePicker sidebar.
 *
 * Static presets:
 * - "today", "yesterday", "tomorrow"
 * - "this-week", "last-week", "next-week"
 * - "this-month", "last-month", "next-month"
 * - "this-year", "last-year", "next-year"
 *
 * Dynamic presets (replace 'X' with a number):
 * - "last-X-weeks", "next-X-weeks" (Max X: 52)
 * - "last-X-months", "next-X-months" (Max X: 12)
 * - "last-X-years", "next-X-years" (Max X: 10)
 */
type PresetId = StaticPresetId | DynamicPresetId | string;

interface DateRangePickerProps {
  label?: string;
  description?: string;
  error?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  presets?: PresetId[];
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  defaultToToday?: boolean;
  formatStr?: string;
  disableBefore?: Date;
  disableAfter?: Date;
  isTypeable?: boolean;
  typeableFormat?: string;
  variant?: "rounded" | "curved" | "square";
  labelPlacement?: "top" | "left" | "right";
  labelWidth?: string;
  "labelAlign-X"?: "left" | "center" | "right";
  "labelAlign-Y"?: "top" | "middle" | "bottom";
  className?: string;
}

export const DateRangePicker = ({
  label,
  description,
  error,
  value,
  onChange,
  presets: enabledPresets,
  minYear = 1900,
  maxYear = 2100,
  placeholder,
  defaultToToday = false,
  formatStr = "dd/mm/yyyy",
  disableBefore,
  disableAfter,
  isTypeable = false,
  typeableFormat = "dd/mm/yyyy",
  variant = "curved",
  labelPlacement = "top",
  labelWidth = "w-32",
  "labelAlign-X": labelAlignX,
  "labelAlign-Y": labelAlignY = "middle",
  className,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(
    value || { from: undefined, to: undefined },
  );
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);
  const [viewDate, setViewDate] = useState<Date>(range.from || new Date());
  const [activeBox, setActiveBox] = useState<"from" | "to">("from");
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  /* Core Utilities from root.config */
  const {
    format: baseFormat = (d: Date) => d.toDateString(),
    addMonths = (d: Date, n: number) =>
      new Date(d.getFullYear(), d.getMonth() + n, 1),
    subMonths = (d: Date, n: number) =>
      new Date(d.getFullYear(), d.getMonth() - n, 1),
    startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1),
    endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0),
    startOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day;
      return new Date(date.setDate(diff));
    },
    endOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() + (6 - day);
      return new Date(date.setDate(diff));
    },
    eachDayOfInterval = ({ start, end }: { start: Date; end: Date }) => {
      const days = [];
      let current = new Date(start);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    },
    isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString(),
    addDays = (d: Date, n: number) => {
      const r = new Date(d);
      r.setDate(r.getDate() + n);
      return r;
    },
    subDays = (d: Date, n: number) => {
      const r = new Date(d);
      r.setDate(r.getDate() - n);
      return r;
    },
    startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1),
    endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31),
    addYears = (d: Date, n: number) =>
      new Date(d.getFullYear() + n, d.getMonth(), d.getDate()),
    subYears = (d: Date, n: number) =>
      new Date(d.getFullYear() - n, d.getMonth(), d.getDate()),
  } = DateUtils as any;

  const format = (d: Date, fmtStr: string) => {
    const normalized = fmtStr.replace(/mm/g, "MM");
    return baseFormat(d, normalized);
  };

  /* Local helper functions for missing exports */
  const isBeforeDate = (d1: Date, d2: Date) => d1.getTime() < d2.getTime();
  const isAfterDate = (d1: Date, d2: Date) => d1.getTime() > d2.getTime();

  const isDateDisabled = (date: Date) => {
    if (
      disableBefore &&
      isBeforeDate(date, disableBefore) &&
      !isSameDay(date, disableBefore)
    )
      return true;
    if (
      disableAfter &&
      isAfterDate(date, disableAfter) &&
      !isSameDay(date, disableAfter)
    )
      return true;
    return false;
  };

  React.useEffect(() => {
    if (range.from && range.to && isTypeable && !isFocused) {
      setInputValue(
        `${format(range.from, typeableFormat)} to ${format(range.to, typeableFormat)}`,
      );
    } else if (!range.from && !range.to && !isFocused) {
      setInputValue("");
    }
  }, [range, isTypeable, typeableFormat, isFocused, format]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;
    let cPos = e.target.selectionStart || 0;
    let nativeEvent = e.nativeEvent as InputEvent;
    let isDeleting = nativeEvent.inputType === "deleteContentBackward";

    const rawBeforeCursor = rawVal.slice(0, cPos);
    const valueCharsBefore = (rawBeforeCursor.match(/[0-9]/g) || []).length;

    let digits = rawVal.replace(/\D/g, "").slice(0, 16);
    let oldDigits = inputValue.replace(/\D/g, "");

    /* If they backspaced a delimiter, force remove a digit */
    if (isDeleting && oldDigits.length === digits.length && digits.length > 0) {
      /* Find which digit to remove based on cursor position.
         A simple fallback: just remove the last digit if we can't pinpoint it,
         but actually, since they deleted a delimiter, the mask will just put it back.
         To actually delete the digit before the delimiter, we can just slice the digits. */
      digits = digits.slice(0, -1);
      cPos--;
    }

    let masked = "";

    /* Date 1 */
    if (digits.length > 0) masked += digits.slice(0, 2);
    if (digits.length > 2) masked += "/" + digits.slice(2, 4);
    if (digits.length > 4) masked += "/" + digits.slice(4, 8);

    if (digits.length > 8) masked += " to ";

    /* Date 2 */
    if (digits.length > 8) masked += digits.slice(8, 10);
    if (digits.length > 10) masked += "/" + digits.slice(10, 12);
    if (digits.length > 12) masked += "/" + digits.slice(12, 16);

    /* Calculate full mask for cursor */
    let baseTemplate = typeableFormat.replace(/[a-zA-Z]/g, "_");
    let template = `${baseTemplate} to ${baseTemplate}`;
    let fullMask = "";
    for (let i = 0; i < template.length; i++) {
      if (masked[i]) fullMask += masked[i];
      else fullMask += template[i];
    }

    let newCPos = 0;
    let count = 0;
    for (let i = 0; i < fullMask.length; i++) {
      if (/[0-9]/.test(fullMask[i])) count++;
      if (count === valueCharsBefore) {
        newCPos = i + 1;
        break;
      }
    }
    if (valueCharsBefore === 0) newCPos = 0;
    else if (count < valueCharsBefore) newCPos = fullMask.length;

    if (!isDeleting) {
      while (fullMask[newCPos] && /[^0-9A-P_]/.test(fullMask[newCPos])) {
        newCPos++;
      }
    } else {
      while (
        newCPos > 0 &&
        fullMask[newCPos - 1] &&
        /[^0-9A-P_]/.test(fullMask[newCPos - 1])
      ) {
        newCPos--;
      }
    }

    setCursorPos(newCPos);
    setInputValue(masked);

    if (digits.length === 16) {
      const p1 = masked.split(" to ")[0];
      const p2 = masked.split(" to ")[1];
      if (p1 && p2) {
        const d1 = new Date(p1);
        const d2 = new Date(p2);
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
          setRange({ from: d1, to: d2 });
          onChange?.({ from: d1, to: d2 });
        }
      }
    } else if (digits.length === 0) {
      setRange({ from: undefined, to: undefined });
      onChange?.({ from: undefined, to: undefined });
    }
  };

  const getFullMaskedValue = () => {
    if (!isFocused && !inputValue) return "";
    let current = inputValue;
    let baseTemplate = typeableFormat.replace(/[a-zA-Z]/g, "_");
    let template = `${baseTemplate} to ${baseTemplate}`;

    let res = "";
    for (let i = 0; i < template.length; i++) {
      if (current[i]) res += current[i];
      else res += template[i];
    }
    return res;
  };

  const handleFocus = () => {
    setIsFocused(true);
    const pos = inputValue.length;
    setTimeout(() => inputRef.current?.setSelectionRange(pos, pos), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
    if (!/[0-9 \-:/TO]/.test(e.key.toUpperCase())) {
      e.preventDefault();
    }
  };

  React.useLayoutEffect(() => {
    if (isFocused && inputRef.current && cursorPos !== null) {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [inputValue, isFocused, cursorPos]);

  const { refs, floatingStyles, context } = useFloating({
    open: !isTypeable && isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "start" }),
      shift(),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(400, availableHeight - 20)}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { enabled: !isTypeable });
  const dismiss = useDismiss(context, { enabled: !isTypeable });
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const calendarDays = useMemo(() => {
    try {
      const start = startOfWeek(startOfMonth(viewDate));
      const end = endOfWeek(endOfMonth(viewDate));
      return eachDayOfInterval({ start, end }) as Date[];
    } catch (e) {
      return [] as Date[];
    }
  }, [
    viewDate,
    startOfWeek,
    startOfMonth,
    endOfWeek,
    endOfMonth,
    eachDayOfInterval,
  ]);

  const allStaticPresets = [
    {
      id: "yesterday",
      label: "Yesterday",
      getValue: () => {
        const d = subDays(new Date(), 1);
        return { from: d, to: d };
      },
    },
    {
      id: "today",
      label: "Today",
      getValue: () => ({ from: new Date(), to: new Date() }),
    },
    {
      id: "tomorrow",
      label: "Tomorrow",
      getValue: () => {
        const d = addDays(new Date(), 1);
        return { from: d, to: d };
      },
    },
    {
      id: "last-week",
      label: "Last Week",
      getValue: () => {
        const d = subDays(new Date(), 7);
        return { from: startOfWeek(d), to: endOfWeek(d) };
      },
    },
    {
      id: "this-week",
      label: "This Week",
      getValue: () => ({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date()),
      }),
    },
    {
      id: "next-week",
      label: "Next Week",
      getValue: () => {
        const d = addDays(new Date(), 7);
        return { from: startOfWeek(d), to: endOfWeek(d) };
      },
    },
    {
      id: "last-month",
      label: "Last Month",
      getValue: () => {
        const d = subMonths(new Date(), 1);
        return { from: startOfMonth(d), to: endOfMonth(d) };
      },
    },
    {
      id: "this-month",
      label: "This Month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      id: "next-month",
      label: "Next Month",
      getValue: () => {
        const d = addMonths(new Date(), 1);
        return { from: startOfMonth(d), to: endOfMonth(d) };
      },
    },
    {
      id: "last-year",
      label: "Last Year",
      getValue: () => {
        const d = subYears(new Date(), 1);
        return { from: startOfYear(d), to: endOfYear(d) };
      },
    },
    {
      id: "this-year",
      label: "This Year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      }),
    },
    {
      id: "next-year",
      label: "Next Year",
      getValue: () => {
        const d = addYears(new Date(), 1);
        return { from: startOfYear(d), to: endOfYear(d) };
      },
    },
  ];

  const presets = useMemo(() => {
    if (!enabledPresets) return [];
    return enabledPresets
      .map(id => {
        const staticMatch = allStaticPresets.find(p => p.id === id);
        if (staticMatch) return staticMatch;
        const parts = id.split("-");
        if (
          parts.length === 3 &&
          (parts[0] === "last" || parts[0] === "next")
        ) {
          const isPast = parts[0] === "last";
          const val = parseInt(parts[1]);
          const unit = parts[2];
          const today = new Date();
          if (!isNaN(val)) {
            if (unit === "weeks") {
              const capped = Math.min(val, 52);
              return {
                id,
                label: `${isPast ? "Last" : "Next"} ${capped} Weeks`,
                getValue: () =>
                  isPast
                    ? { from: subDays(today, capped * 7), to: today }
                    : { from: today, to: addDays(today, capped * 7) },
              };
            }
            if (unit === "months") {
              const capped = Math.min(val, 12);
              return {
                id,
                label: `${isPast ? "Last" : "Next"} ${capped} Months`,
                getValue: () =>
                  isPast
                    ? { from: subMonths(today, capped), to: today }
                    : { from: today, to: addMonths(today, capped) },
              };
            }
            if (unit === "years") {
              const capped = Math.min(val, 10);
              return {
                id,
                label: `${isPast ? "Last" : "Next"} ${capped} Years`,
                getValue: () =>
                  isPast
                    ? { from: subYears(today, capped), to: today }
                    : { from: today, to: addYears(today, capped) },
              };
            }
          }
        }
        return null;
      })
      .filter(p => p !== null) as {
      id: string;
      label: string;
      getValue: () => DateRange;
    }[];
  }, [enabledPresets]);

  const showSidebar = presets.length > 0;

  const isPresetActive = (p: { getValue: () => DateRange }) => {
    const pRange = p.getValue();
    if (!range.from || !pRange.from || !range.to || !pRange.to) return false;
    return isSameDay(range.from, pRange.from) && isSameDay(range.to, pRange.to);
  };

  const handleDateSelect = (date: Date) => {
    if (activeBox === "from") {
      setRange({
        from: date,
        to: range.to && isAfterDate(date, range.to) ? undefined : range.to,
      });
      setActiveBox("to");
    } else {
      if (range.from && isBeforeDate(date, range.from)) {
        setRange({ from: date, to: range.from });
      } else {
        setRange({ ...range, to: date });
      }
      setActiveBox("from");
    }
  };

  const handleBoxClick = (box: "from" | "to") => {
    setActiveBox(box);
    const dateToView = box === "from" ? range.from : range.to;
    if (dateToView) setViewDate(dateToView);
  };

  const isInRange = (date: Date) => {
    if (range.from && range.to) {
      const start = isBeforeDate(range.from, range.to) ? range.from : range.to;
      const end = isBeforeDate(range.from, range.to) ? range.to : range.from;
      return (
        (isAfterDate(date, start) && isBeforeDate(date, end)) ||
        isSameDay(date, start) ||
        isSameDay(date, end)
      );
    }
    if (range.from && hoverDate) {
      const start = isBeforeDate(hoverDate, range.from)
        ? hoverDate
        : range.from;
      const end = isBeforeDate(hoverDate, range.from) ? range.from : hoverDate;
      return (
        (isAfterDate(date, start) && isBeforeDate(date, end)) ||
        isSameDay(date, start) ||
        isSameDay(date, end)
      );
    }
    return false;
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );

  const monthOptions = useMemo(
    () =>
      months.map((m, i) => ({
        id: m,
        label: m,
        key: i.toString(),
      })),
    [months],
  );

  const yearOptions = useMemo(
    () =>
      years.map(y => ({
        id: y.toString(),
        label: y.toString(),
        key: y.toString(),
      })),
    [years],
  );

  const getDisplayText = () => {
    if (range.from) {
      if (range.to && isSameDay(range.from, range.to))
        return format(range.from, formatStr || "dd/mm/yyyy");

      const isDiffYear =
        range.to && range.from.getFullYear() !== range.to.getFullYear();
      const shortF = formatStr || "MMM d";

      if (isDiffYear && range.to) {
        return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
      }

      const yearF = formatStr ? "" : format(range.to || range.from, ", yyyy");
      return `${format(range.from, shortF)} - ${range.to ? format(range.to, shortF) : "..."}${yearF}`;
    }
    if (placeholder) return placeholder;
    if (defaultToToday) {
      const today = new Date();
      return `${format(today, "MMM d")} - ${format(today, "MMM d, yyyy")}`;
    }
    return "";
  };

  const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
  const xAlignment =
    labelAlignX ||
    (labelPlacement === "left"
      ? "left"
      : labelPlacement === "right"
        ? "right"
        : "left");
  const yAlignmentClass =
    labelAlignY === "top"
      ? "items-start"
      : labelAlignY === "bottom"
        ? "items-end"
        : "items-center";

  const selectionRadius =
    variant === "square"
      ? "rounded-none"
      : variant === "curved"
        ? "rounded-lg"
        : "rounded-full";

  const borderRadius =
    variant === "square"
      ? "rounded-none"
      : variant === "curved"
        ? "rounded-lg"
        : "rounded-full";

  return (
    <div
      className={cn(
        "flex w-full",
        labelPlacement === "top" && "flex-col gap-1.5",
        labelPlacement === "left" && cn("flex-row gap-4", yAlignmentClass),
        labelPlacement === "right" &&
          cn("flex-row-reverse gap-4", yAlignmentClass),
        className,
      )}
    >
      {label && (
        <div
          className={cn(
            "flex flex-col",
            isSideLabel ? "shrink-0" : "w-full",
            labelAlignY === "top" && isSideLabel && "mt-2.5",
          )}
        >
          <div
            className={cn(
              isSideLabel ? labelWidth : "w-full",
              "flex flex-col",
              xAlignment === "left" && "items-start text-left",
              xAlignment === "right" && "items-end text-right",
              xAlignment === "center" && "items-center text-center",
            )}
          >
            <span className="text-sm font-medium text-black">{label}</span>
            {description && (
              <span className="text-[11px] text-black font-medium mt-0.5">
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 relative group">
        {isTypeable ? (
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={getFullMaskedValue()}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={() => setIsFocused(false)}
              placeholder={`${typeableFormat.toLowerCase()} to ${typeableFormat.toLowerCase()}`}
              className={cn(
                "flex items-center w-full pl-10 pr-2 h-9 border-[1.5px] border-black transition-all duration-200 bg-white text-md text-black outline-none placeholder:text-black/40 placeholder:text-sm placeholder:font-medium font-medium",
                borderRadius,
                isFocused
                  ? "border-sky-500 ring-4 ring-sky-500/10 shadow-lg"
                  : "hover:border-gray-800",
                error && "border-red-500 ring-4 ring-red-500/10 text-red-500",
              )}
            />
            <CalendarIcon
              size={16}
              className={cn(
                "absolute left-3 transition-colors",
                error ? "text-red-500" : "text-black",
              )}
            />
          </div>
        ) : (
          <button
            type="button"
            ref={refs.setReference}
            {...getReferenceProps()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "flex items-center pr-2 w-full h-9 border-[1.5px] border-black transition-all duration-200 bg-white font-medium text-black cursor-pointer",
              borderRadius,
              isOpen
                ? "border-sky-500 ring-4 ring-sky-500/10"
                : "hover:border-gray-800",
              error && "border-red-500 ring-4 ring-red-500/10",
            )}
          >
            <div className="flex items-center pl-2.25 pr-2 shrink-0">
              <CalendarIcon size={16} className="text-black" />
            </div>
            <span
              className={cn(
                "text-md flex-1 text-left truncate text-black",
                !range.from && !defaultToToday && "text-gray-400",
              )}
            >
              {range.from ? getDisplayText() : placeholder || ""}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-black transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>
        )}

        {isOpen && !isTypeable && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-[9999] flex bg-white border-[1.5px] border-black rounded-xl shadow-xl animate-in fade-in duration-200 max-w-[95vw] overflow-hidden"
              >
                {/* Sidebar Panel */}
                {showSidebar && isPanelVisible && (
                  <div className="w-44 shrink-0 border-r border-black bg-black flex flex-col min-h-0">
                    <div className="flex items-center justify-between p-4 pb-2 border-b border-white/50">
                      <span className="text-xs font-semibold text-white uppercase">
                        Presets
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 flex flex-col gap-0.5">
                      {presets.map(p => {
                        const active = isPresetActive(p);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              const r = p.getValue();
                              setRange(r);
                              if (r.from) setViewDate(r.from);
                              setActiveBox("from");
                            }}
                            className={cn(
                              "px-3 py-2 text-xs font-semibold  text-left rounded-lg transition-all cursor-pointer truncate",
                              active
                                ? "bg-white text-black z-10"
                                : "text-white hover:bg-white/15 ",
                            )}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Content */}
                <div
                  className={cn(
                    "flex flex-col min-w-[340px] flex-1 min-h-0 bg-white",
                  )}
                >
                  <div className="flex items-center gap-2 p-4 pb-0">
                    {showSidebar && (
                      <button
                        onClick={() => setIsPanelVisible(!isPanelVisible)}
                        className="p-1.5 bg-black/10 hover:bg-sky-500/10 hover:text-sky-500 rounded-lg  text-black cursor-pointer transition-colors shrink-0"
                      >
                        {isPanelVisible ? (
                          <PanelLeftClose size={16} />
                        ) : (
                          <PanelLeft size={16} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleBoxClick("from")}
                      className={cn(
                        "flex-1 p-1.5 border-[1.5px] transition-all rounded-lg text-center font-bold  uppercase text-[11px] cursor-pointer truncate",
                        activeBox === "from"
                          ? "border-sky-500 bg-sky-500/10 text-sky-600"
                          : "border-black hover:border-gray-800 text-black",
                      )}
                    >
                      {range.from
                        ? format(range.from, formatStr || "dd/mm/yyyy")
                        : "START"}
                    </button>
                    <button
                      onClick={() => handleBoxClick("to")}
                      className={cn(
                        "flex-1 p-1.5 border-[1.5px] transition-all rounded-lg text-center font-bold uppercase text-[11px] cursor-pointer truncate",
                        activeBox === "to"
                          ? "border-sky-500 bg-sky-500/10 text-sky-600"
                          : "border-black hover:border-gray-800 text-black",
                      )}
                    >
                      {range.to
                        ? format(range.to, formatStr || "dd/mm/yyyy")
                        : "END"}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between p-4">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setViewDate(subMonths(viewDate, 1));
                        }}
                        className="h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer text-black bg-black/10 hover:bg-sky-500/10 hover:text-sky-500 transition-all duration-150"
                      >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                      </button>
                      <div className="flex items-center gap-2">
                        <SelectInput
                          options={monthOptions}
                          value={viewDate.getMonth().toString()}
                          onChange={key => {
                            setViewDate(
                              new Date(
                                viewDate.getFullYear(),
                                parseInt(key),
                                1,
                              ),
                            );
                          }}
                          width="w-24"
                        />
                        <SelectInput
                          options={yearOptions}
                          value={viewDate.getFullYear().toString()}
                          onChange={key => {
                            setViewDate(
                              new Date(parseInt(key), viewDate.getMonth(), 1),
                            );
                          }}
                          width="w-24"
                        />
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setViewDate(addMonths(viewDate, 1));
                        }}
                        className="h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer text-black bg-black/10 hover:bg-sky-500/10 hover:text-sky-500 transition-all duration-150"
                      >
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-7 gap-px">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                          <div
                            key={d}
                            className="h-8 flex items-center justify-center text-xs font-semibold text-black uppercase"
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7">
                        {calendarDays.map((date: Date, i: number) => {
                          const active = isInRange(date);
                          const isStart =
                            range.from && isSameDay(date, range.from);
                          const isEnd = range.to && isSameDay(date, range.to);
                          const isOutside =
                            format(date, "M") !== format(viewDate, "M");
                          const disabled = isDateDisabled(date);
                          const isToday = isSameDay(date, new Date());

                          return (
                            <div
                              key={i}
                              className="h-9 relative flex items-center justify-center"
                              onMouseEnter={() =>
                                !range.to && setHoverDate(date)
                              }
                              onMouseLeave={() => setHoverDate(undefined)}
                            >
                              {active && !isOutside && (
                                <div
                                  className={cn(
                                    "absolute inset-0 bg-black/10 z-0",
                                    isStart &&
                                      cn(
                                        selectionRadius === "rounded-full"
                                          ? "rounded-l-full"
                                          : selectionRadius === "rounded-lg"
                                            ? "rounded-l-lg"
                                            : "rounded-none",
                                        "ml-1",
                                      ),
                                    isEnd &&
                                      cn(
                                        selectionRadius === "rounded-full"
                                          ? "rounded-r-full"
                                          : selectionRadius === "rounded-lg"
                                            ? "rounded-r-lg"
                                            : "rounded-none",
                                        "mr-1",
                                      ),
                                    !isStart && !isEnd && "mx-0",
                                  )}
                                />
                              )}
                              <button
                                disabled={disabled}
                                onClick={() => handleDateSelect(date)}
                                className={cn(
                                  "w-7 h-7 text-xs font-semibold relative z-10 transition-all",
                                  selectionRadius,
                                  isStart || isEnd
                                    ? "bg-black text-white shadow-lg scale-110"
                                    : !isOutside
                                      ? "text-black hover:bg-black/10"
                                      : "text-black/50",
                                  isToday &&
                                    !(isStart || isEnd) &&
                                    "bg-sky-500/10 text-sky-500",
                                  disabled
                                    ? "opacity-20 cursor-not-allowed"
                                    : "cursor-pointer",
                                )}
                              >
                                {format(date, "d")}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 p-4 pt-0 flex items-center justify-end gap-3 bg-white z-50">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-[12px] font-semibold uppercase text-black/50 hover:text-black hover:bg-black/10 rounded-full cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onChange?.(range);
                        setIsOpen(false);
                      }}
                      className="px-8 py-2 bg-black text-white rounded-full text-[12px] font-semibold uppercase transition-all cursor-pointer "
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    </div>
  );
};
