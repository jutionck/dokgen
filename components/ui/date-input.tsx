"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, onClick, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      if (onClick) onClick(e);
      try {
        internalRef.current?.showPicker?.();
      } catch {
        // Fallback for browsers that don't support showPicker
      }
    };

    return (
      <div className="group relative flex w-full items-center">
        <input
          ref={internalRef}
          type="date"
          value={value}
          onChange={onChange}
          onClick={handleClick}
          className={cn(
            "flex h-9 w-full cursor-pointer rounded-md border border-input bg-white px-3 py-1 pr-9 text-sm font-medium text-slate-800 shadow-xs transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
            className
          )}
          {...props}
        />
        <CalendarIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-slate-600" />
      </div>
    );
  }
);
DateInput.displayName = "DateInput";
