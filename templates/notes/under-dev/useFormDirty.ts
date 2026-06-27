import { useRef } from "react";

export function useFormDirty<T>(values: T): boolean {
  const initialRef = useRef(values);
  return JSON.stringify(values) !== JSON.stringify(initialRef.current);
}
