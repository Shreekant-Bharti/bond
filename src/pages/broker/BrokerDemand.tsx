import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useBondContext } from "@/context/BondContext";
import { TrendingUp, Activity, Users, BarChart3, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface BondDemand {
  bondId: string;
  bondName: string;
  issuer: string;
  quantityRequested: number;
  walletBackedRequests: number;
  demandScore: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
}

export default function BrokerDemand() {
  const { bonds, transactions, broker } = useBondContext();

  // Calculate demand analytics
  const demandData = useMemo<BondDemand[]>(() => {
    const listedBonds = bonds.filter(b => broker.listedBonds.includes(b.id));
    
    return listedBonds.map(bond => {
      const bondTx = transactions.filter(t => t.bondId === bond.id && t.type === 'purchase');
      const totalRequested = bondTx.reduce((acc, t) => acc + t.amount, 0);
      
      // Simulate wallet-backed requests (60-90% of total)
      const walletBacked = Math.floor(totalRequested * (0.6 + Math.random() * 0.3));
      
      // Calculate demand score
      const demandRatio = totalRequested / bond.totalSupply;
      let demandScore: 'high' | 'medium' | 'low' = 'low';
      if (demandRatio > 0.3) demandScore = 'high';
      else if (demandRatio > 0.1) demandScore = 'medium';

      // Random trend for demo
      const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
      const trend = trends[Math.floor(Math.random() * 3)];

      return {
        bondId: bond.id,
        bondName: bond.name,
        issuer: bond.issuer,
        quantityRequested: totalRequested + Math.floor(Math.random() * 1000), // Add some simulated demand
        walletBackedRequests: walletBacked + Math.floor(Math.random() * 50),
        demandScore,
        trend,
      };
    });
  }, [bonds, transactions, broker.listedBonds]);

  const totalDemand = demandData.reduce((acc, d) => acc + d.quantityRequested, 0);
  const totalWalletBacked = demandData.reduce((acc, d) => acc + d.walletBackedRequests, 0);
  const highDemandCount = demandData.filter(d => d.demandScore === 'high').length;

  return (
    <DashboardLayout title="Investor Demand" subtitle="Real-time aggregated demand analytics">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Demand</p>
                <p className="text-2xl font-bold text-foreground">{totalDemand.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-success/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet-Backed</p>
                <p className="text-2xl font-bold text-foreground">{totalWalletBacked.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-warning/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Demand</p>
                <p className="text-2xl font-bold text-foreground">{highDemandCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-secondary/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bonds Tracked</p>
                <p className="text-2xl font-bold text-foreground">{demandData.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Demand by Bond */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Bond-wise Demand</h3>
              <p className="text-sm text-muted-foreground">Aggregated investor interest per bond</p>
            </div>
          </div>

          <div className="space-y-4">
            {demandData.map((demand, index) => (
              <div 
                key={demand.bondId}
                className="p-4 rounded-xl bg-muted/10 border border-border/30 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{demand.bondName}</p>
                    <p className="text-sm text-muted-foreground">{demand.issuer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      demand.demandScore === 'high' && "bg-success/20 text-success",
                      demand.demandScore === 'medium' && "bg-warning/20 text-warning",
                      demand.demandScore === 'low' && "bg-muted/30 text-muted-foreground"
                    )}>
                      {demand.demandScore.charAt(0).toUpperCase() + demand.demandScore.slice(1)} Demand
                    </span>
                    {demand.trend === 'up' && (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    )}
                    {demand.trend === 'down' && (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-card/60">
                    <p className="text-xs text-muted-foreground mb-1">Quantity Requested</p>
                    <p className="text-lg font-bold text-foreground">{demand.quantityRequested.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60">
                    <div className="flex items-center gap-1 mb-1">
                      <Wallet className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Wallet-Backed</p>
                    </div>
                    <p className="text-lg font-bold text-success">{demand.walletBackedRequests.toLocaleString()}</p>
                  </div>
                </div>

                {/* Demand Bar */}
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        demand.demandScore === 'high' && "bg-gradient-to-r from-success to-primary",
                        demand.demandScore === 'medium' && "bg-gradient-to-r from-warning to-primary",
                        demand.demandScore === 'low' && "bg-muted-foreground/50"
                      )}
                      style={{ 
                        width: `${demand.demandScore === 'high' ? 85 : demand.demandScore === 'medium' ? 55 : 25}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {demandData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No demand data available</p>
              <p className="text-sm mt-1">List bonds to start tracking investor demand</p>
            </div>
          )}
        </Card>

        {/* Privacy Note */}
        <Card className="p-4 bg-muted/10 border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            This view shows aggregated demand data only. No personal investor information is displayed.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
