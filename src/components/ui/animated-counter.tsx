import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, prefix = '', suffix = '', className, decimals = 0 }: AnimatedCounterProps) {
  return (
    <span className={cn("tabular-nums font-mono", className)}>
      {prefix}
      {value.toLocaleString('en-US', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}
      {suffix}
    </span>
  );
}
