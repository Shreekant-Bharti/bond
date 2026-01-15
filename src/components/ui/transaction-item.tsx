import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, FileCheck, Send } from "lucide-react";

interface TransactionItemProps {
  type: 'purchase' | 'sale' | 'listing' | 'issuance' | 'settlement';
  description: string;
  amount: number;
  value: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  className?: string;
}

export function TransactionItem({
  type,
  description,
  amount,
  value,
  timestamp,
  status,
  className,
}: TransactionItemProps) {
  const icons = {
    purchase: ArrowDownLeft,
    sale: ArrowUpRight,
    listing: Send,
    issuance: FileCheck,
    settlement: RefreshCw,
  };

  const iconColors = {
    purchase: "text-success bg-success/20",
    sale: "text-warning bg-warning/20",
    listing: "text-primary bg-primary/20",
    issuance: "text-secondary bg-secondary/20",
    settlement: "text-accent bg-accent/20",
  };

  const statusColors = {
    pending: "bg-warning/20 text-warning border-warning/30",
    completed: "bg-success/20 text-success border-success/30",
    failed: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border border-border bg-card/40",
        "transition-all duration-200 hover:bg-card/60",
        className
      )}
    >
      <div className={cn("p-2 rounded-lg", iconColors[type])}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">${value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{amount.toLocaleString()} units</p>
      </div>

      <Badge className={cn("border ml-2", statusColors[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
  );
}
