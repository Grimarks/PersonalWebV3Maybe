import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  /** id unik per grup supaya animasi pill aktif tidak bentrok antar grup */
  layoutId: string;
  className?: string;
}

/** Deretan tombol filter berbentuk pill dengan indikator aktif yang bergeser halus. */
export function FilterPills({ options, value, onChange, layoutId, className }: FilterPillsProps) {
  return (
    <div role="group" aria-label="Filter" className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "relative isolate rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary-foreground"
                : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">
              {opt.label}
              {typeof opt.count === "number" && (
                <span className={cn("ml-1.5 text-xs", active ? "opacity-80" : "opacity-60")}>{opt.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
