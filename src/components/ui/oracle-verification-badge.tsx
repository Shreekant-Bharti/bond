import { useState, useEffect } from "react";
import { 
  CheckCircle, AlertTriangle, Link2, RefreshCw, Info, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  fetchReferenceYield, 
  verifyBondRate, 
  formatOracleTimestamp,
  getChainlinkExplanation,
  getStoredOracleData,
  OracleData,
  RateVerificationResult 
} from "@/lib/oracleService";

interface OracleVerificationBadgeProps {
  listingYield: number;
  compact?: boolean;
  showRefresh?: boolean;
  className?: string;
}

export function OracleVerificationBadge({ 
  listingYield, 
  compact = false,
  showRefresh = true,
  className 
}: OracleVerificationBadgeProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(getStoredOracleData());
  const [verification, setVerification] = useState<RateVerificationResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAndVerify = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchReferenceYield();
      setOracleData(data);
      const result = verifyBondRate(listingYield, data);
      setVerification(result);
    } catch (error) {
      console.error('Oracle fetch error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAndVerify();
  }, [listingYield]);

  if (!verification) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Verifying rate...</span>
      </div>
    );
  }

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: "Oracle Verified",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
    },
    flagged: {
      icon: AlertTriangle,
      label: "Rate Flagged",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
    },
    pending: {
      icon: Loader2,
      label: "Verifying...",
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
      borderColor: "border-border",
    },
  };

  const config = statusConfig[verification.status];
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-help",
              config.bgColor,
              config.borderColor,
              "border",
              className
            )}>
              <Icon className={cn("w-3.5 h-3.5", config.color, verification.status === 'pending' && "animate-spin")} />
              <span className={config.color}>{config.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-4 bg-card border-border/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Oracle Rate Verification</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Reference Yield: <span className="text-foreground font-medium">{verification.referenceYield}%</span></p>
                <p>Listing Yield: <span className="text-foreground font-medium">{verification.listingYield}%</span></p>
                <p className={verification.toleranceExceeded ? "text-warning" : "text-success"}>
                  Difference: {verification.difference}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                {getChainlinkExplanation()}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-4",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground text-sm">Oracle Rate Verification</span>
        </div>
        <div className="flex items-center gap-2">
          {showRefresh && (
            <button 
              onClick={fetchAndVerify}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-50"
              title="Refresh oracle data"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isRefreshing && "animate-spin")} />
            </button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 bg-card border-border/50">
                <p className="text-xs text-muted-foreground">
                  {getChainlinkExplanation()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Oracle Source
          </span>
          <span className="text-foreground font-medium">{verification.source}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Reference Yield
          </span>
          <span className="text-foreground font-medium">{verification.referenceYield}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Listing Yield
          </span>
          <span className="text-foreground font-medium">{verification.listingYield}%</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/30">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-4 h-4", config.color, verification.status === 'pending' && "animate-spin")} />
            <span className={cn("font-medium", config.color)}>{config.label}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Last Checked</span>
          <span className="text-muted-foreground">{formatOracleTimestamp(verification.lastChecked)}</span>
        </div>
      </div>

      {verification.status === 'flagged' && (
        <div className="mt-3 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              Listed yield deviates from official reference data by {verification.difference}%. 
              This may indicate pricing that differs from current market rates.
            </p>
          </div>
        </div>
      )}

      {verification.status === 'verified' && (
        <div className="mt-3 p-2.5 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <p className="text-xs text-success">
              Pricing is verified against official government bond reference data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
