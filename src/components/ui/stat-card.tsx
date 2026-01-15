import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(175_80%_50%/0.2)]",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
