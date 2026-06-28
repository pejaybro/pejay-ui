import React, { useState, useRef, useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  shift,
  size,
  offset,
  FloatingPortal,
} from "@floating-ui/react";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/pejay-ui/utils/cn";
import { Tooltip } from "@/pejay-ui/components/overlays";

export interface SelectOption {
  id: string;
  label: string;
  key: string;
  isHeader?: boolean;
}

function getNextSelectableIndex(
  currentIndex: number,
  direction: "up" | "down",
  list: SelectOption[],
) {
  if (list.length === 0) return -1;
  let nextIndex = currentIndex;

  for (let i = 0; i < list.length; i++) {
    if (direction === "down") {
      nextIndex = nextIndex < list.length - 1 ? nextIndex + 1 : 0;
    } else {
      nextIndex = nextIndex > 0 ? nextIndex - 1 : list.length - 1;
    }
    if (!list[nextIndex]?.isHeader) {
      return nextIndex;
    }
  }
  return currentIndex;
}

export interface SelectInputProps {
  /** Array of option objects: { id, label, key } */
  options: SelectOption[];
  /** Controlled value (key). If undefined, component runs in uncontrolled mode */
  value?: string;
  /** Default selected key for uncontrolled mode */
  defaultValue?: string;
  /** Callback triggered when a new option is selected */
  onChange?: (key: string, option: SelectOption) => void;
  /** Optional placeholder if no option is selected */
  placeholder?: string;
  /** Optional icon rendered on the left of the select button trigger */
  prefixIcon?: React.ReactNode;
  /** Custom class name for the wrapper */
  className?: string;
  /** Custom width for the button (e.g. 'w-64', 'w-full') */
  width?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Show full selected value in a tooltip on hover */
  showTooltip?: boolean;
  /** Enable filtering search functionality */
  searchable?: boolean;
  /** Position of the search input: 'trigger' (direct typing in trigger) or 'dropdown' (input inside overlay) */
  searchPosition?: "trigger" | "dropdown";
  /** Error state message or boolean flag */
  error?: string | boolean;
}

// A helper component to conditionally display a tooltip only if the wrapped child is truncated
function TruncatedTooltip({
  content,
  children,
  enabled,
}: {
  content: string;
  children: React.ReactElement<any>;
  enabled: boolean;
}) {
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const checkTruncation = () => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    setIsTruncated(el.scrollWidth > el.clientWidth);
  };

  const trigger = React.cloneElement(children, {
    ref,
    onMouseEnter: (e: React.MouseEvent) => {
      checkTruncation();
      children.props.onMouseEnter?.(e);
    },
  });

  return (
    <Tooltip content={content} disabled={!enabled || !isTruncated} fullWidth>
      {trigger}
    </Tooltip>
  );
}

export function SelectInput({
  options = [],
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Select...",
  prefixIcon,
  className,
  width = "w-full",
  disabled = false,
  loading = false,
  showTooltip = false,
  searchable = false,
  searchPosition = "trigger",
  error,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");

  // Uncontrolled fallback state: checks defaultValue, else defaults to empty string
  const [localValue, setLocalValue] = useState<string>(() => {
    return defaultValue !== undefined ? defaultValue : "";
  });

  const activeValue =
    controlledValue !== undefined ? controlledValue : localValue;

  // Find currently selected option
  const selectedOption = options.find(opt => opt.key === activeValue);

  // Filter options based on search query, keeping headers only if their group contains matches
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;

    const result: SelectOption[] = [];
    let currentHeader: SelectOption | null = null;
    let hasItemsInCurrentGroup = false;

    for (const opt of options) {
      if (opt.isHeader) {
        currentHeader = opt;
        hasItemsInCurrentGroup = false;
      } else {
        const matches = opt.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        if (matches) {
          if (currentHeader && !hasItemsInCurrentGroup) {
            result.push(currentHeader);
            hasItemsInCurrentGroup = true;
          }
          result.push(opt);
        }
      }
    }
    return result;
  }, [options, searchQuery]);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownInputRef = useRef<HTMLInputElement>(null);

  // 1. Setup Floating UI
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: open => {
      setIsOpen(open);
      if (!open) {
        setSearchQuery("");
      }
    },
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
        padding: 8,
      }),
    ],
  });

  // Highlight first option or selected option when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (searchQuery !== "") {
        const firstIdx = filteredOptions.findIndex(opt => !opt.isHeader);
        setHighlightedIndex(firstIdx >= 0 ? firstIdx : 0);
      } else {
        const selectedIdx = filteredOptions.findIndex(
          opt => opt.key === activeValue && !opt.isHeader,
        );
        if (selectedIdx >= 0) {
          setHighlightedIndex(selectedIdx);
        } else {
          const firstIdx = filteredOptions.findIndex(opt => !opt.isHeader);
          setHighlightedIndex(firstIdx >= 0 ? firstIdx : 0);
        }
      }

      // Auto-focus search input inside dropdown if searchPosition is 'dropdown'
      if (searchable && searchPosition === "dropdown") {
        setTimeout(() => dropdownInputRef.current?.focus(), 50);
      }
    }
  }, [
    isOpen,
    searchQuery,
    activeValue,
    searchable,
    searchPosition,
    filteredOptions,
  ]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const itemsContainer = listRef.current;
    // Account for dropdown search input layout if present
    const itemEl = itemsContainer.children[highlightedIndex] as HTMLElement;
    if (itemEl) {
      itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex, isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        refs.floating.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs.floating]);

  const selectOption = (opt: SelectOption) => {
    if (controlledValue === undefined) {
      setLocalValue(opt.key);
    }
    onChange?.(opt.key, opt);
    setSearchQuery("");
    setIsOpen(false);
  };

  const typeBufferRef = useRef("");
  const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || loading) return;

    if (!isOpen) {
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        setIsOpen(true);
        if (searchable && searchPosition === "trigger") {
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }
      return;
    }

    // Typeahead matching: only enabled when NOT searching
    if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      typeBufferRef.current += e.key.toLowerCase();

      const matchIndex = filteredOptions.findIndex(opt =>
        opt.label.toLowerCase().startsWith(typeBufferRef.current),
      );

      if (matchIndex !== -1) {
        setHighlightedIndex(matchIndex);
      }

      if (typeTimeoutRef.current) {
        clearTimeout(typeTimeoutRef.current);
      }

      typeTimeoutRef.current = setTimeout(() => {
        typeBufferRef.current = "";
      }, 500);

      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          getNextSelectableIndex(prev, "down", filteredOptions),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev =>
          getNextSelectableIndex(prev, "up", filteredOptions),
        );
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Spacebar":
      case " ":
        // Only trigger selection on space when NOT actively typing in search inputs
        if (
          !searchable ||
          (searchable &&
            e.target !== inputRef.current &&
            e.target !== dropdownInputRef.current)
        ) {
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            selectOption(filteredOptions[highlightedIndex]);
          }
        }
        break;
      case "Escape":
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const isTriggerSearchActive = searchable && searchPosition === "trigger";

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", width, className)}
    >
      {/* Trigger Button */}
      <div
        ref={refs.setReference}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(prev => !prev);
            if (!isOpen && isTriggerSearchActive) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled || loading || isTriggerSearchActive ? -1 : 0}
        className={cn(
          "flex items-center justify-between rounded-lg border-[1.5px] border-black text-sm select-none cursor-pointer outline-none transition-all duration-150 h-9 w-full",
          "bg-white text-black hover:border-gray-800 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10",
          error &&
            "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10",
          (disabled || loading) &&
            "opacity-50 pointer-events-none cursor-not-allowed border-gray-300",
        )}
      >
        {/* Left Prefix Icon Area */}
        {prefixIcon && (
          <div className="flex items-center pl-3 text-black shrink-0 h-full">
            {prefixIcon}
          </div>
        )}

        {/* Central Content Area */}
        <div className="flex items-center min-w-0 flex-1 px-3 py-2 h-full">
          {loading ? (
            <span className="text-gray-400 animate-pulse flex-1 text-left min-w-0 text-sm font-medium">
              Loading...
            </span>
          ) : isTriggerSearchActive ? (
            /* Search Trigger Variant: direct input */
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none text-black placeholder:text-gray-400 outline-none text-left p-0 text-sm font-medium"
              placeholder={
                selectedOption
                  ? selectedOption.label
                  : options.length === 0
                    ? "No options available"
                    : placeholder
              }
              value={
                isOpen
                  ? searchQuery
                  : selectedOption
                    ? selectedOption.label
                    : ""
              }
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onClick={e => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            />
          ) : (
            /* Static Text Trigger Variant */
            <TruncatedTooltip
              content={selectedOption?.label || ""}
              enabled={showTooltip && !!selectedOption}
            >
              <span className="truncate text-black flex-1 text-left min-w-0 font-medium">
                {selectedOption
                  ? selectedOption.label
                  : options.length === 0
                    ? "No options available"
                    : placeholder}
              </span>
            </TruncatedTooltip>
          )}
        </div>

        {/* Right Caret Icon Area */}
        <div className="flex items-center pr-3 pl-1 text-black shrink-0 h-full">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-sky-500" />
          ) : (
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          )}
        </div>
      </div>

      {/* Portal Dropdown Menu */}
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            onKeyDown={handleKeyDown}
            className="z-[9999] overflow-hidden rounded-lg border-[1.5px] border-black bg-white p-1 shadow-2xl flex flex-col"
          >
            {/* Search Position: Dropdown layout input header */}
            {searchable && searchPosition === "dropdown" && (
              <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-200 mb-1 select-none">
                <Search size={14} className="text-black shrink-0" />
                <input
                  ref={dropdownInputRef}
                  type="text"
                  placeholder="Search options..."
                  className="w-full bg-transparent border-none text-xs text-black placeholder:text-gray-400 outline-none p-0 flex-1 font-medium"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSearchQuery("");
                      dropdownInputRef.current?.focus();
                    }}
                    className="text-black bg-black/10 p-1 cursor-pointer hover:text-red-500 hover:bg-red-500/10 rounded outline-none shrink-0"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* List options wrapper */}
            <div
              ref={listRef}
              className="max-h-60 overflow-y-auto flex flex-col gap-0.5 no-scrollbar"
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-xs text-left select-none">
                  No options available
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-xs text-left select-none">
                  No results found
                </div>
              ) : (
                filteredOptions.map((item, index) => {
                  if (item.isHeader) {
                    return (
                      <div
                        key={item.id}
                        className="px-3 py-1.5 text-[10px] font-bold text-black tracking-wider uppercase text-left select-none pointer-events-none mt-1 border-t border-gray-200/50 first:mt-0 first:border-none"
                      >
                        {item.label}
                      </div>
                    );
                  }

                  const isSelected = item.key === activeValue;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => selectOption(item)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm select-none cursor-pointer transition-colors duration-75",
                        isSelected &&
                          "text-sky-600 font-semibold bg-sky-500/10",
                        isHighlighted &&
                          !isSelected &&
                          "bg-black/5 text-black",
                        !isHighlighted &&
                          !isSelected &&
                          "text-black hover:bg-black/5",
                      )}
                    >
                      <span className="flex-1 whitespace-normal break-words text-left">
                        {item.label}
                      </span>

                      {isSelected && (
                        <Check size={14} className="text-sky-600 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
