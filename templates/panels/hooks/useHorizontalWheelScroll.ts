import { useEffect, useRef } from "react";

export function useHorizontalWheelScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      if (maxScrollLeft <= 0) return;

      // Preserve native horizontal trackpad / shift+wheel gestures.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      event.preventDefault();
      event.stopPropagation();
      element.scrollLeft += event.deltaY;
    };

    element.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    return () =>
      element.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  return ref;
}
