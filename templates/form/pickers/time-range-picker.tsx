import React, { useState, useMemo } from "react";
import { cn } from "@/pejay-ui/utils/cn";
import { Clock, ChevronDown } from "lucide-react";
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

interface TimeRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface TimeRangePickerProps {
  label?: string;
  description?: string;
  error?: string;
  value?: TimeRange;
  onChange?: (range: TimeRange) => void;
  timeFormat?: "12hr" | "24hr";
  showSeconds?: boolean;
  isTypeable?: boolean;
  placeholder?: string;
  variant?: "rounded" | "curved" | "square";
  labelPlacement?: "top" | "left" | "right";
  labelWidth?: string;
  "labelAlign-X"?: "left" | "center" | "right";
  "labelAlign-Y"?: "top" | "middle" | "bottom";
  className?: string;
}

export const TimeRangePicker = ({
  label,
  description,
  error,
  value,
  onChange,
  timeFormat = "12hr",
  showSeconds = false,
  isTypeable = false,
  placeholder,
  variant = "curved",
  labelPlacement = "top",
  labelWidth = "w-32",
  "labelAlign-X": labelAlignX,
  "labelAlign-Y": labelAlignY = "middle",
  className,
}: TimeRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const [range, setRange] = useState<TimeRange>(value || { from: undefined, to: undefined });
  const [activeBox, setActiveBox] = useState<"from" | "to">("from");
  const [isFocused, setIsFocused] = useState(false);

  const { format = (d: Date) => d.toLocaleTimeString() } = DateUtils as any;

  const is12Hour = timeFormat === "12hr";

  const displayFormat = useMemo(() => {
    let f = is12Hour ? "hh:mm" : "HH:mm";
    if (showSeconds) f += ":ss";
    if (is12Hour) f += " aa";
    return f;
  }, [is12Hour, showSeconds]);

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
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const handleBoxClick = (box: "from" | "to") => setActiveBox(box);

  const activeDate = activeBox === "from" ? range.from : range.to;

  const currentHour = activeDate ? (is12Hour ? (activeDate.getHours() % 12 || 12) : activeDate.getHours()) : null;
  const currentMinute = activeDate ? activeDate.getMinutes() : null;
  const currentSecond = activeDate ? activeDate.getSeconds() : null;
  const currentPeriod = activeDate ? (activeDate.getHours() >= 12 ? "PM" : "AM") : "AM";

  const hours = Array.from({ length: is12Hour ? 12 : 24 }, (_, i) => is12Hour ? i + 1 : i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const secs = Array.from({ length: 60 }, (_, i) => i);

  const handleTimeSelect = (h: number, m: number, s: number, p?: string) => {
    const baseDate = activeDate || new Date();
    const newDate = new Date(baseDate);
    
    let hour = h;
    if (is12Hour) {
      const isPM = p === "PM";
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }
    newDate.setHours(hour, m, s, 0);

    if (activeBox === "from") {
      setRange({ from: newDate, to: range.to });
    } else {
      setRange({ ...range, to: newDate });
    }
  };

  const getDisplayText = () => {
    if (range.from) {
      if (range.to) return `${format(range.from, displayFormat)} - ${format(range.to, displayFormat)}`;
      return `${format(range.from, displayFormat)} - ...`;
    }
    return placeholder || "";
  };

  React.useEffect(() => {
    if (range.from && range.to && isTypeable && !isFocused) {
      const typeFormat = is12Hour ? (showSeconds ? "hh:mm:ss aa" : "hh:mm aa") : (showSeconds ? "HH:mm:ss" : "HH:mm");
      setInputValue(`${format(range.from, typeFormat)} to ${format(range.to, typeFormat)}`);
    } else if (!range.from && !range.to && !isFocused) {
      setInputValue("");
    }
  }, [range, isTypeable, showSeconds, is12Hour, isFocused, format]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.toUpperCase();
    let cPos = e.target.selectionStart || 0;
    let nativeEvent = e.nativeEvent as InputEvent;
    let isDeleting = nativeEvent.inputType === "deleteContentBackward";
    
    const rawBeforeCursor = rawVal.slice(0, cPos);
    const valueCharsBefore = (rawBeforeCursor.match(/[0-9AP]/g) || []).length;

    let digits = rawVal.replace(/\D/g, "");
    let oldDigits = inputValue.replace(/\D/g, "");

    const digitLimit = showSeconds ? 12 : 8;

    if (isDeleting && oldDigits.length === digits.length && digits.length > 0) {
      digits = digits.slice(0, -1);
      cPos--;
    }

    digits = digits.slice(0, digitLimit);
    const midIdx = showSeconds ? 4 : 4;
    
    let ampm1 = "";
    let ampm2 = "";

    if (is12Hour) {
      const parts = rawVal.split("TO");
      const p1 = parts[0] || "";
      const p2 = parts[1] || "";
      if (parts.length >= 2) {
        const l1 = parts[0].replace(/[^AP]/g, "");
        const l2 = parts[1].replace(/[^AP]/g, "");
        if (l1.length > 0) ampm1 = l1[l1.length - 1] + "M";
        if (l2.length > 0) ampm2 = l2[l2.length - 1] + "M";
      } else {
        const letters = rawVal.replace(/[^AP]/g, "");
        if (digits.length <= midIdx) {
          if (letters.length > 0) ampm1 = letters[letters.length - 1] + "M";
        } else {
          if (letters.length > 0) ampm1 = letters[0] + "M";
          if (letters.length > 1) ampm2 = letters[letters.length - 1] + "M";
        }
      }

      if (isDeleting) {
         if (p1.trim().endsWith("A") || p1.trim().endsWith("P")) ampm1 = "";
         if (p2.trim().endsWith("P") || p2.trim().endsWith("P")) ampm2 = "";
      }
      
      if (!ampm1 && digits.length > midIdx) {
         digits = digits.slice(0, midIdx);
      }
    }

    let masked = "";
    
    // Time 1
    if (digits.length > 0) masked += digits.slice(0, 2);
    if (digits.length > 2) masked += ":" + digits.slice(2, 4);
    if (showSeconds && digits.length > 4) masked += ":" + digits.slice(4, 6);
    
    if (is12Hour && digits.length >= midIdx) {
      if (ampm1) masked += " " + ampm1;
    }
    
    // Determine if we should show `to`
    if (digits.length > midIdx || (is12Hour && (ampm1 === "AM" || ampm1 === "PM")) || (!is12Hour && digits.length === midIdx)) {
      if (!masked.includes(" to ")) masked += " to ";
    }
    
    // Time 2
    if (digits.length > midIdx) masked += digits.slice(midIdx, midIdx + 2);
    if (digits.length > midIdx + 2) masked += ":" + digits.slice(midIdx + 2, midIdx + 4);
    if (showSeconds && digits.length > midIdx + 4) masked += ":" + digits.slice(midIdx + 4, midIdx + 6);
    
    if (is12Hour && digits.length >= digitLimit) {
      if (ampm2) masked += " " + ampm2;
    }

    let baseTemplate = showSeconds ? "__:__:__" : "__:__";
    if (is12Hour) baseTemplate += " __";
    let template = `${baseTemplate} to ${baseTemplate}`;

    let fullMask = "";
    for (let i = 0; i < template.length; i++) {
      if (masked[i]) fullMask += masked[i];
      else fullMask += template[i];
    }

    let newCPos = 0;
    let count = 0;
    for (let i = 0; i < fullMask.length; i++) {
      if (/[0-9AP]/.test(fullMask[i])) count++;
      if (count === valueCharsBefore) {
        newCPos = i + 1;
        break;
      }
    }
    if (valueCharsBefore === 0) newCPos = 0;
    else if (count < valueCharsBefore) newCPos = fullMask.length;

    if (!isDeleting) {
      while (fullMask[newCPos] && /[^0-9A-P_]/.test(fullMask[newCPos])) {
        // Prevent leaping into the second time box if AM/PM 1 is missing
        if (is12Hour && !ampm1 && digits.length === midIdx && fullMask.substring(newCPos, newCPos + 4) === " to ") {
          break;
        }
        if (fullMask[newCPos] === " " && fullMask[newCPos + 1] === "_") {
           break;
        }
        newCPos++;
      }
    } else {
      while (newCPos > 0 && fullMask[newCPos - 1] && /[^0-9A-P]/.test(fullMask[newCPos - 1])) {
        newCPos--;
      }
    }

    setCursorPos(newCPos);
    setInputValue(masked);

    const isComplete = is12Hour 
      ? digits.length === digitLimit && (masked.endsWith("AM") || masked.endsWith("PM")) && (masked.includes(" AM to ") || masked.includes(" PM to "))
      : digits.length === digitLimit;

    if (isComplete && masked.includes(" to ")) {
      const p1 = masked.split(" to ")[0];
      const p2 = masked.split(" to ")[1];
      if (p1 && p2) {
        const today = new Date();
        const p1Parts = p1.split(" ");
        const p2Parts = p2.split(" ");
        const t1 = p1Parts[0].split(":");
        const t2 = p2Parts[0].split(":");
        
        let h1 = parseInt(t1[0]);
        let h2 = parseInt(t2[0]);
        
        if (is12Hour) {
          if (p1Parts[1] === "PM" && h1 < 12) h1 += 12;
          if (p1Parts[1] === "AM" && h1 === 12) h1 = 0;
          if (p2Parts[1] === "PM" && h2 < 12) h2 += 12;
          if (p2Parts[1] === "AM" && h2 === 12) h2 = 0;
        }

        const d1 = new Date(today.setHours(h1, parseInt(t1[1]), showSeconds ? parseInt(t1[2]) : 0, 0));
        const today2 = new Date();
        const d2 = new Date(today2.setHours(h2, parseInt(t2[1]), showSeconds ? parseInt(t2[2]) : 0, 0));
        
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
    if (!isFocused && inputValue) return inputValue;

    let current = inputValue;
    
    let baseTemplate = showSeconds ? "__:__:__" : "__:__";
    if (is12Hour) baseTemplate += " __";
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
    if (!/[0-9A-P: TO]/.test(e.key.toUpperCase())) {
      e.preventDefault();
    }
  };

  React.useLayoutEffect(() => {
    if (isFocused && inputRef.current && cursorPos !== null) {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [inputValue, isFocused, cursorPos]);

  const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
  const xAlignment = labelAlignX || (
    labelPlacement === "left" ? "left" : 
    labelPlacement === "right" ? "right" : "left"
  );
  const yAlignmentClass = 
    labelAlignY === "top" ? "items-start" :
    labelAlignY === "bottom" ? "items-end" : "items-center";

  const borderRadius = variant === "square" ? "rounded-none" : variant === "curved" ? "rounded-lg" : "rounded-full";

  return (
    <div className={cn("flex w-full", labelPlacement === "top" && "flex-col gap-1.5", labelPlacement === "left" && cn("flex-row gap-4", yAlignmentClass), labelPlacement === "right" && cn("flex-row-reverse gap-4", yAlignmentClass), className)}>
      {label && (
        <div className={cn("flex flex-col", isSideLabel ? "shrink-0" : "w-full", labelAlignY === "top" && isSideLabel && "mt-2.5")}>
          <div className={cn(
            isSideLabel ? labelWidth : "w-full", 
            "flex flex-col", 
            xAlignment === "left" && "items-start text-left", 
            xAlignment === "right" && "items-end text-right", 
            xAlignment === "center" && "items-center text-center"
          )}>
            <span className="text-sm font-medium text-black">{label}</span>
            {description && <span className="text-[11px] text-black font-medium mt-0.5">{description}</span>}
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
              placeholder={is12Hour ? (showSeconds ? "hh:mm:ss aa to hh:mm:ss aa" : "hh:mm aa to hh:mm aa") : (showSeconds ? "HH:mm:ss to HH:mm:ss" : "HH:mm to HH:mm")}
              className={cn(
                "flex items-center w-full pl-10 pr-2 h-9 border-[1.5px] border-black transition-all duration-200 bg-white text-md text-black outline-none placeholder:text-black/40 placeholder:text-sm placeholder:font-medium font-medium",
                borderRadius,
                isFocused ? "border-sky-500 ring-4 ring-sky-500/10 shadow-lg" : "hover:border-gray-800",
                error && "border-red-500 ring-4 ring-red-500/10 text-red-500"
              )}
            />
            <Clock size={16} className={cn("absolute left-3 transition-colors", error ? "text-red-500" : "text-black")} />
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
              isOpen ? "border-sky-500 ring-4 ring-sky-500/10" : "hover:border-gray-800",
              error && "border-red-500 ring-4 ring-red-500/10"
            )}
          >
            <div className="flex items-center pl-2.25 pr-2 shrink-0">
              <Clock size={16} className="text-black" />
            </div>
            <span className={cn("text-md flex-1 text-left truncate text-black", !range.from && "text-gray-400")}>
              {range.from ? getDisplayText() : (placeholder || "")}
            </span>
            <ChevronDown size={14} className={cn("text-black transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        )}

        {isOpen && !isTypeable && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-[9999] flex flex-col min-w-[340px] bg-white border-[1.5px] border-black rounded-xl shadow-2xl animate-in fade-in duration-200 overflow-hidden"
              >
                <div className="flex items-center gap-2 p-4 pb-0">
                  <button onClick={() => handleBoxClick("from")} className={cn("flex-1 p-1.5 border-[1.5px] transition-all rounded-lg text-center font-bold uppercase text-[11px] cursor-pointer truncate", activeBox === "from" ? "border-sky-500 bg-sky-500/10 text-sky-600" : "border-black hover:border-gray-800 text-black")}>
                    {range.from ? format(range.from, displayFormat) : "START TIME"}
                  </button>
                  <button onClick={() => handleBoxClick("to")} className={cn("flex-1 p-1.5 border-[1.5px] transition-all rounded-lg text-center font-bold uppercase text-[11px] cursor-pointer truncate", activeBox === "to" ? "border-sky-500 bg-sky-500/10 text-sky-600" : "border-black hover:border-gray-800 text-black")}>
                    {range.to ? format(range.to, displayFormat) : "END TIME"}
                  </button>
                </div>

                <div className="flex p-4 justify-center gap-1 min-h-[220px] max-h-[300px]">
                  {/* Hour Column */}
                  <div className="flex flex-col overflow-y-auto custom-scrollbar px-1 flex-1">
                     <div className="text-[10px] font-semibold tracking-widest text-black uppercase p-2 sticky top-0 bg-white text-center">Hour</div>
                     {hours.map(h => (
                       <button
                         key={h}
                         onClick={() => handleTimeSelect(h, currentMinute || 0, currentSecond || 0, currentPeriod)}
                         className={cn(
                           "w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer mx-auto",
                           currentHour === h ? "bg-black text-white shadow-lg" : "hover:bg-black/5 text-black"
                         )}
                       >
                         {h.toString().padStart(2, "0")}
                       </button>
                     ))}
                  </div>

                  {/* Minute Column */}
                  <div className="flex flex-col overflow-y-auto custom-scrollbar px-1 border-l border-black flex-1">
                     <div className="text-[10px] font-semibold tracking-widest text-black uppercase p-2 sticky top-0 bg-white text-center">Min</div>
                     {minutes.map(m => (
                       <button
                         key={m}
                         onClick={() => handleTimeSelect(currentHour || (is12Hour ? 12 : 0), m, currentSecond || 0, currentPeriod)}
                         className={cn(
                           "w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer mx-auto",
                           currentMinute === m ? "bg-black text-white shadow-lg" : "hover:bg-black/5 text-black"
                         )}
                       >
                         {m.toString().padStart(2, "0")}
                       </button>
                     ))}
                  </div>

                  {/* Seconds Column */}
                  {showSeconds && (
                    <div className="flex flex-col overflow-y-auto custom-scrollbar px-1 border-l border-black flex-1">
                      <div className="text-[10px] font-semibold tracking-widest text-black uppercase p-2 sticky top-0 bg-white text-center">Sec</div>
                      {secs.map(s => (
                        <button
                          key={s}
                          onClick={() => handleTimeSelect(currentHour || (is12Hour ? 12 : 0), currentMinute || 0, s, currentPeriod)}
                          className={cn(
                            "w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer mx-auto",
                            currentSecond === s ? "bg-black text-white shadow-lg" : "hover:bg-black/5 text-black"
                          )}
                        >
                          {s.toString().padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AM/PM Column */}
                  {is12Hour && (
                    <div className="flex flex-col px-1 border-l border-black flex-1">
                      <div className="text-[10px] font-semibold tracking-widest text-black uppercase p-2 text-center">Per</div>
                      {["AM", "PM"].map(p => (
                        <button
                          key={p}
                          onClick={() => handleTimeSelect(currentHour || 12, currentMinute || 0, currentSecond || 0, p)}
                          className={cn(
                            "w-12 h-10 shrink-0 flex items-center justify-center rounded-lg text-[11px] font-bold tracking-widest transition-all cursor-pointer mx-auto",
                            currentPeriod === p ? "bg-black text-white shadow-lg" : "hover:bg-black/10 text-black"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 p-4 pt-0 flex items-center justify-end gap-3 bg-white z-50">
                  <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-[12px] font-semibold uppercase text-black/50 hover:text-black cursor-pointer">Cancel</button>
                  <button onClick={() => { onChange?.(range); setIsOpen(false); }} className="px-8 py-2 bg-black text-white rounded-full text-[12px] font-semibold uppercase transition-all cursor-pointer">Apply</button>
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    </div>
  );
};

TimeRangePicker.displayName = "TimeRangePicker";
