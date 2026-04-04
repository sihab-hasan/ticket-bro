import { useEffect } from "react";

export const useOnClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled || !ref?.current || typeof handler !== "function") {
      return undefined;
    }

    const listener = (event) => {
      const element = ref.current;
      if (!element || element.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [enabled, handler, ref]);
};

export const useClickOutside = useOnClickOutside;
export default useOnClickOutside;
