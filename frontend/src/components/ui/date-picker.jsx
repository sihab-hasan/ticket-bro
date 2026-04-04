import React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export const DatePicker = React.forwardRef(
  ({ className, placeholder = "Select date", value, onChange, required, min, ...props }, ref) => {
    const normalizedValue =
      value instanceof Date
        ? value.toISOString().slice(0, 10)
        : typeof value === "string"
          ? value.slice(0, 10)
          : "";

    return (
      <label className="relative block">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="date"
          value={normalizedValue}
          onChange={(event) => onChange?.(event.target.value, event)}
          required={required}
          min={min}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !normalizedValue && "text-muted-foreground",
            className,
          )}
          aria-label={placeholder}
          {...props}
        />
        {!normalizedValue && (
          <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
      </label>
    );
  },
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
