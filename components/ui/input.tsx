import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  labelSlot?: ReactNode;
}

export function Input({
  label,
  hint,
  labelSlot,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {(label || labelSlot) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="text-label text-accent font-semibold">
              {label}
            </label>
          )}
          {labelSlot}
        </div>
      )}
      <input
        id={inputId}
        className={`text-body border-border-strong bg-bg-surface text-text-primary placeholder:text-text-faint focus:border-primary w-full rounded-md border px-[14px] py-3 outline-none ${className}`}
        {...props}
      />
      {hint && <div className="text-micro text-text-faint">{hint}</div>}
    </div>
  );
}
