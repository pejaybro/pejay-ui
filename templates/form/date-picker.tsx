import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { cn } from "@/utils/cn";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { SelectInput } from "../select-dropdown/select-input";
const DateUtils = {};
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";

interface DatePickerProps {
  label?: string;
  description?: string;
  error?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  defaultToToday?: boolean;
  formatStr?: string;
  isTypeable?: boolean;
  typeableFormat?: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
  disableBefore?: Date;
  disableAfter?: Date;
  variant?: "rounded" | "curved" | "square";
  labelPlacement?: "top" | "left" | "right";
  labelWidth?: string;
  "labelAlign-X"?: "left" | "center" | "right";
  "labelAlign-Y"?: "top" | "middle" | "bottom";
  className?: string;
}

export const DatePicker = ({
  label,
  description,
  error: errorProp,
  value,
  onChange,
  minYear = 1900,
  maxYear = 2100,
  placeholder,
  defaultToToday = false,
  formatStr = "dd/mm/yyyy",
  isTypeable = false,
  typeableFormat = "dd/mm/yyyy",
  disableBefore,
  disableAfter,
  variant = "curved",
  labelPlacement = "top",
  labelWidth = "w-32",
  "labelAlign-X": labelAlignX,
  "labelAlign-Y": labelAlignY = "middle",
  className,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value || new Date());
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<number | null>(null);

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
    isToday = (d: Date) => d.toDateString() === new Date().toDateString(),
  } = DateUtils as any;

  const format = (d: Date, fmtStr: string) => {
    const normalized = fmtStr.replace(/mm/g, "MM");
    return baseFormat(d, normalized);
  };

  /* Local helper functions to satisfy TS and missing exports */
  const isValidDate = (d: any): d is Date =>
    d instanceof Date && !isNaN(d.getTime());

  const parseDate = (str: string, fmt: string) => {
    try {
      const parts = str.split(fmt.includes("/") ? "/" : "-");
      if (parts.length !== 3) return new Date("invalid");

      let day, month, year;
      if (fmt.startsWith("dd")) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else if (fmt.startsWith("MM")) {
        month = parts[0];
        day = parts[1];
        year = parts[2];
      } else {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }

      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } catch (e) {
      return new Date("invalid");
    }
  };

  const isBeforeDate = (d1: Date, d2: Date) => d1.getTime() < d2.getTime();
  const isAfterDate = (d1: Date, d2: Date) => d1.getTime() > d2.getTime();

  const { refs, floatingStyles, context } = useFloating({
    open: !isTypeable && isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
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

  useEffect(() => {
    if (value && isTypeable && !isFocused) {
      setInputValue(format(value, typeableFormat));
      setInternalError(false);
    }
  }, [value, isTypeable, typeableFormat, isFocused, format]);

  const validatePart = (val: string, type: "day" | "month" | "year") => {
    const num = parseInt(val);
    if (isNaN(num)) return true;
    if (type === "month" && (num < 1 || num > 12)) return false;
    if (type === "day" && (num < 1 || num > 31)) return false;
    if (type === "year" && val.length === 4 && (num < minYear || num > maxYear))
      return false;
    return true;
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cPos = e.target.selectionStart || 0;
    let nativeEvent = e.nativeEvent as InputEvent;
    let isDeleting = nativeEvent.inputType === "deleteContentBackward";

    let rawVal = e.target.value;
    const rawBeforeCursor = rawVal.slice(0, cPos);
    const valueCharsBefore = (rawBeforeCursor.match(/[0-9]/g) || []).length;

    let digits = rawVal.replace(/\D/g, "");
    let oldDigits = inputValue.replace(/\D/g, "");

    if (isDeleting && oldDigits.length === digits.length && digits.length > 0) {
      digits = digits.slice(0, -1);
      cPos--;
    }

    const delimiter = typeableFormat.includes("/") ? "/" : "-";
    const isISO = typeableFormat.startsWith("yyyy");

    let masked = "";
    let hasError = false;

    if (isISO) {
      const year = digits.substring(0, 4);
      const month = digits.substring(4, 6);
      const day = digits.substring(6, 8);
      if (
        !validatePart(year, "year") ||
        !validatePart(month, "month") ||
        !validatePart(day, "day")
      )
        hasError = true;
      if (digits.length > 0) masked += year;
      if (digits.length >= 5) masked += delimiter + month;
      if (digits.length >= 7) masked += delimiter + day;
    } else {
      const first = digits.substring(0, 2);
      const second = digits.substring(2, 4);
      const year = digits.substring(4, 8);
      const isMDY = typeableFormat.startsWith("MM");
      if (!validatePart(first, isMDY ? "month" : "day")) hasError = true;
      if (!validatePart(second, isMDY ? "day" : "month")) hasError = true;
      if (!validatePart(year, "year")) hasError = true;
      if (digits.length > 0) masked += first;
      if (digits.length >= 3) masked += delimiter + second;
      if (digits.length >= 5) masked += delimiter + year;
    }

    masked = masked.substring(0, 10);

    let template = typeableFormat.replace(/[a-zA-Z]/g, "_");
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
      while (fullMask[newCPos] && /[^0-9_]/.test(fullMask[newCPos])) {
        newCPos++;
      }
    } else {
      while (
        newCPos > 0 &&
        fullMask[newCPos - 1] &&
        /[^0-9_]/.test(fullMask[newCPos - 1])
      ) {
        newCPos--;
      }
    }

    setCursorPos(newCPos);
    setInputValue(masked);

    if (masked.length === 10) {
      try {
        const parsed = parseDate(masked, typeableFormat);
        if (isValidDate(parsed)) {
          if (isDateDisabled(parsed)) hasError = true;
          else onChange?.(parsed);
        } else {
          hasError = true;
        }
      } catch (e) {
        hasError = true;
      }
    }

    setInternalError(hasError);
  };

  const getFullMaskedValue = () => {
    if (!isFocused && !inputValue) return "";
    let current = inputValue;
    const template = typeableFormat.replace(/[a-zA-Z]/g, "_");
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
    setTimeout(() => {
      inputRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
    if (!/[0-9 \-:/]/.test(e.key.toUpperCase())) {
      e.preventDefault();
    }
  };

  React.useLayoutEffect(() => {
    if (isFocused && inputRef.current && cursorPos !== null) {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [inputValue, isFocused, cursorPos]);

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

  const getDisplayText = () => {
    if (value) return format(value, formatStr);
    if (placeholder) return placeholder;
    if (defaultToToday) return format(new Date(), formatStr);
    return "";
  };

  const hasError = internalError || !!errorProp;

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
            <span className="text-sm font-medium text-black">
              {label}
            </span>
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
              placeholder={typeableFormat.toLowerCase()}
              className={cn(
                "flex items-center w-full pl-10 pr-2 h-9 border-[1.5px] border-black transition-all duration-200 bg-white text-md text-black outline-none placeholder:text-black/40 placeholder:text-sm placeholder:font-medium font-medium",
                borderRadius,
                isFocused
                  ? "border-sky-500 ring-4 ring-sky-500/10 shadow-lg"
                  : "hover:border-gray-800",
                hasError &&
                  "border-red-500 ring-4 ring-red-500/10 text-red-500",
              )}
            />
            <CalendarIcon
              size={16}
              className={cn(
                "absolute left-3 transition-colors",
                hasError ? "text-red-500" : "text-black",
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
              isOpen && "border-sky-500 ring-4 ring-sky-500/10",
              errorProp && "border-red-500 ring-4 ring-red-500/10",
            )}
          >
            <div className="flex items-center pl-2.25 pr-2 shrink-0">
              <CalendarIcon size={16} className="text-black" />
            </div>
            <span
              className={cn("text-md flex-1 text-left truncate text-black")}
            >
              {getDisplayText()}
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
                className="z-[9999] p-4 bg-white border-[1.5px] border-black rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-center gap-2 justify-between mb-4 px-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setViewDate(subMonths(viewDate, 1));
                    }}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border-[1.5px] border-black cursor-pointer text-black hover:border-gray-800 transition-all duration-150"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>

                  <SelectInput
                    options={monthOptions}
                    value={viewDate.getMonth().toString()}
                    onChange={key => {
                      setViewDate(
                        new Date(viewDate.getFullYear(), parseInt(key), 1),
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

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setViewDate(addMonths(viewDate, 1));
                    }}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border-[1.5px] border-black cursor-pointer text-black hover:border-gray-800 transition-all duration-150"
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-px mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div
                      key={d}
                      className="h-8 flex items-center justify-center text-xs font-semibold text-black uppercase tracking-widest"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {calendarDays.map((date: Date, i: number) => {
                    const isSelected = value && isSameDay(date, value);
                    const isOutside =
                      format(date, "M") !== format(viewDate, "M");
                    const today = isToday(date);
                    const disabled = isDateDisabled(date);

                    return (
                      <div
                        key={i}
                        className="h-9 flex items-center justify-center"
                      >
                        <button
                          disabled={disabled}
                          onClick={() => {
                            onChange?.(date);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-7 h-7 text-xs font-semibold transition-all relative",
                            selectionRadius,
                            isSelected
                              ? "bg-black text-white scale-100 z-10"
                              : !isOutside
                                ? "text-black hover:bg-black/10"
                                : "text-gray-600",
                            today &&
                              !isSelected &&
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
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    </div>
  );
};
