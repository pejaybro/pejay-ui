import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export function useRouterSearch<T extends Record<string, any>>({
  defaultParams,
}: {
  defaultParams: T;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  /*
   * Keep defaults in a ref so setSearch always reads the latest defaults without
   * forcing callbacks to be recreated. Prefer passing a stable default object.
   */
  const defaultRef = useRef(defaultParams);
  defaultRef.current = defaultParams;

  const search = useMemo(() => {
    const result = { ...defaultRef.current };
    const keys = Object.keys(defaultRef.current);

    for (const key of keys) {
      const fallback = defaultRef.current[key];
      if (Array.isArray(fallback)) {
        // Repeated URL keys are parsed back into arrays, e.g. ?color=red&color=blue.
        const val = searchParams.getAll(key);
        if (val.length > 0) {
          result[key as keyof T] = parseValue(val, fallback) as any;
        }
      } else {
        const val = searchParams.get(key);
        if (val !== null) {
          result[key as keyof T] = parseValue(val, fallback) as any;
        }
      }
    }
    return result;
  }, [searchParams]);

  const setSearch = useCallback(
    (
      updates: Partial<Record<keyof T, any>>,
      options?: { resetPage?: boolean; replace?: boolean }
    ) => {
      const next = new URLSearchParams(searchParams);
      const keys = Object.keys(defaultRef.current);

      for (const key of keys) {
        const value = updates[key as keyof T];
        if (value !== undefined) {
          // null or the default value removes the key, keeping URLs shareable and minimal.
          if (value === null || areEqual(value, defaultRef.current[key])) {
            next.delete(key);
          } else if (Array.isArray(value)) {
            // Delete first so array updates replace previous repeated keys instead of appending to them.
            next.delete(key);
            value.forEach((val) => {
              if (val !== undefined && val !== null && val !== "") {
                next.append(key, String(val));
              }
            });
          } else {
            next.set(key, String(value));
          }
        }
      }
      /**
       * Reset pagination
       * when filters/search changes
       */
      if (options?.resetPage && "page" in defaultRef.current) {
        next.delete("page");
      }

      setSearchParams(next, {
        replace: options?.replace,
      });
    },
    [searchParams, setSearchParams]
  );

  return { search, setSearch };
}

function areEqual(a: any, b: any) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    // Treat array query params as order-insensitive filter sets.
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  }
  return a === b;
}

function parseValue(value: string | string[], fallback: any): any {
  if (Array.isArray(fallback)) {
    const fallbackVal = fallback[0];
    const valArray = Array.isArray(value) ? value : [value];
    return valArray.map((item) => parseSingleValue(item, fallbackVal));
  }
  const singleVal = Array.isArray(value) ? value[0] : value;
  return parseSingleValue(singleVal, fallback);
}

function parseSingleValue(value: string, fallback: any) {
  if (typeof fallback === "number") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Boolean parsing
   */
  if (typeof fallback === "boolean") {
    return value === "true";
  }

  /**
   * String fallback
   */
  return value;
}

/*
# NOTE: Array parameter usage example

1. Define the default parameter as an array:
   export const DefaultSearch = {
     color: [] as string[],
   };

2. Set values (e.g., in a component):
   setSearch({ color: ["red", "blue"] });
   // Resulting URL query: ?color=red&color=blue

3. Read values (e.g., in a component):
   const colors = search.color; // Returns ["red", "blue"]
*/
