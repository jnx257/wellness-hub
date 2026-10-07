interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="bg-bg-tab-track flex gap-1 rounded-[11px] p-1">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`text-body-sm flex-1 rounded-lg border-none py-[9px] font-semibold ${
              active ? "bg-bg-surface text-primary" : "text-text-muted bg-transparent"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
