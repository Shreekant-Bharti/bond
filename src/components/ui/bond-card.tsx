import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface BondCardProps {
  name: string;
  issuer: string;
  yield: number;
  tenure: number;
  value: number;
  minInvestment: number;
  availableSupply: number;
  status: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function BondCard({
  name,
  issuer,
  yield: bondYield,
  tenure,
  value,
  minInvestment,
  availableSupply,
  status,
  onAction,
  actionLabel = "View Details",
  className,
}: BondCardProps) {
  const statusColors: Record<string, string> = {
    available: "bg-warning/20 text-warning border-warning/30",
    listed: "bg-success/20 text-success border-success/30",
    sold: "bg-muted/20 text-muted-foreground border-muted/30",
    matured: "bg-primary/20 text-primary border-primary/30",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(175_80%_50%/0.2)]",
        "group",
        className
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{issuer}</p>
          </div>
          <Badge className={cn("border", statusColors[status])}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Yield</p>
            <p className="text-xl font-bold text-success">{bondYield}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Tenure</p>
            <p className="text-xl font-bold text-foreground">{tenure} mo</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Min. Investment</p>
            <p className="text-lg font-semibold text-foreground">${minInvestment}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Available</p>
            <p className="text-lg font-semibold text-foreground">{availableSupply.toLocaleString()}</p>
          </div>
        </div>

        {onAction && (
          <button
            onClick={onAction}
            className={cn(
              "w-full py-2.5 rounded-lg font-medium text-sm",
              "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
              "transition-all duration-300 hover:shadow-[0_0_20px_hsl(175_80%_50%/0.4)]",
              "active:scale-[0.98]"
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
