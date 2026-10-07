import type { ButtonHTMLAttributes } from "react";

const VARIANT_CLASSES = {
  primary:
    "border-none bg-primary text-on-primary hover:bg-primary-hover disabled:bg-text-disabled",
  secondary:
    "border border-border-accent bg-bg-surface text-accent hover:bg-bg-tab-track disabled:border-transparent disabled:bg-text-disabled disabled:text-on-primary",
  ghost:
    "border-none bg-transparent text-text-muted hover:bg-bg-tab-track disabled:text-text-disabled",
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASSES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`text-body rounded-md px-5 py-[13px] font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
