import { cn } from "../../lib/cn";

interface SegmentedControlProps<T extends string> {
  readonly options: readonly T[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly getLabel?: (value: T) => string;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  getLabel = (item) => item
}: SegmentedControlProps<T>) => (
  <div className="grid grid-flow-col rounded-2xl border border-white/8 bg-white/6 p-1">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={cn(
          "tap rounded-xl px-3 py-2 text-sm font-bold text-white/62",
          option === value && "bg-white text-[#0a0a0c] shadow-lg"
        )}
      >
        {getLabel(option)}
      </button>
    ))}
  </div>
);
