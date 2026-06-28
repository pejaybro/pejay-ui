import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

interface PortalProps {
  children: ReactNode;
}
export function Portal({ children }: PortalProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    div.id = "dynamic-portal";
    document.body.appendChild(div);
    setContainer(div);

    return () => {
      if (div.parentNode) {
        document.body.removeChild(div);
      }
    };
  }, []);

  if (!container) return null;

  return createPortal(children, container);
}
