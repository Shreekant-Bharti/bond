import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBondContext } from "@/context/BondContext";
import { FileText, TrendingUp, X, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OracleVerificationBadge } from "@/components/ui/oracle-verification-badge";

export default function BrokerListedBonds() {
  const { bonds, broker, transactions, currentUser } = useBondContext();
  // Show all bonds created by this lister (including pending approval)
  const listedBonds = bonds.filter(b => 
    broker.listedBonds.includes(b.id) || b.listerId === currentUser?.id || b.listerId === broker.id
  );
  const [selectedBond, setSelectedBond] = useState<string | null>(null);

  const selectedBondData = selectedBond ? bonds.find(b => b.id === selectedBond) : null;

  // Calculate analytics for selected bond
  const getBondAnalytics = (bondId: string) => {
    const bond = bonds.find(b => b.id === bondId);
    if (!bond) return null;

    const bondTransactions = transactions.filter(t => t.bondId === bondId);
    const totalSold = bond.totalSupply - bond.availableSupply;
    const demandRatio = totalSold / bond.totalSupply;
    
    return {
      totalListed: bond.totalSupply,
      remaining: bond.availableSupply,
      sold: totalSold,
      demandRatio,
      transactionCount: bondTransactions.length,
      performanceScore: Math.min(100, Math.round(demandRatio * 100 + 20)),
    };
  };

  return (
    <DashboardLayout title="Listed Bonds" subtitle="View and manage your active bond listings">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Listed</p>
                <p className="text-2xl font-bold text-foreground">{listedBonds.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-success/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{listedBonds.filter(b => b.status === 'listed').length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-secondary/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Yield</p>
                <p className="text-2xl font-bold text-foreground">
                  {(listedBonds.reduce((acc, b) => acc + b.yield, 0) / listedBonds.length || 0).toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bonds Table */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bond Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Issuer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Yield</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Available Qty</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {listedBonds.map((bond, index) => (
                  <tr 
                    key={bond.id} 
                    className={cn(
                      "border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in cursor-pointer",
                      selectedBond === bond.id && "bg-primary/5"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedBond(bond.id)}
                  >
                    <td className="p-4">
                      <p className="font-medium text-foreground">{bond.name}</p>
                      <p className="text-xs text-muted-foreground">{bond.tenure} months</p>
                    </td>
                    <td className="p-4 text-foreground">{bond.issuer}</td>
                    <td className="p-4">
                      <span className="text-success font-semibold">{bond.yield}%</span>
                    </td>
                    <td className="p-4 text-foreground">{bond.availableSupply.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        bond.approvalStatus === 'approved' && bond.status === 'listed' ? "bg-success/20 text-success" :
                        bond.approvalStatus === 'pending' ? "bg-warning/20 text-warning animate-pulse" :
                        bond.approvalStatus === 'rejected' ? "bg-destructive/20 text-destructive" :
                        "bg-muted/20 text-muted-foreground"
                      )}>
                        {bond.approvalStatus === 'approved' && bond.status === 'listed' ? 'Active' :
                         bond.approvalStatus === 'approved' ? 'Approved' :
                         bond.approvalStatus === 'pending' ? 'Verification in Progress' :
                         bond.approvalStatus === 'rejected' ? 'Rejected' :
                         bond.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedBond(bond.id); }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listedBonds.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No bonds listed yet</p>
              <p className="text-sm mt-1">List bonds from the dashboard to see them here</p>
            </div>
          )}
        </Card>

        {/* Bond Detail Modal */}
        {selectedBondData && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border/50 p-6 animate-scale-in">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedBondData.name}</h2>
                  <p className="text-muted-foreground">{selectedBondData.issuer}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBond(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Bond Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/10">
                  <p className="text-xs text-muted-foreground">Yield</p>
                  <p className="text-lg font-bold text-success">{selectedBondData.yield}%</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/10">
                  <p className="text-xs text-muted-foreground">Tenure</p>
                  <p className="text-lg font-bold text-foreground">{selectedBondData.tenure} mo</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/10">
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-lg font-bold text-foreground">${selectedBondData.value}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/10">
                  <p className="text-xs text-muted-foreground">Maturity</p>
                  <p className="text-lg font-bold text-foreground">{selectedBondData.maturityDate}</p>
                </div>
              </div>

              {/* Oracle Rate Verification */}
              <OracleVerificationBadge listingYield={selectedBondData.yield} className="mb-6" />

              {/* Analytics */}
              {(() => {
                const analytics = getBondAnalytics(selectedBondData.id);
                if (!analytics) return null;
                
                return (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Listing Performance</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-card border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground">Total Listed</p>
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{analytics.totalListed.toLocaleString()}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-card border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <BarChart3 className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{analytics.remaining.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Demand vs Supply */}
                    <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-foreground">Demand vs Supply</p>
                        {analytics.demandRatio > 0.5 ? (
                          <div className="flex items-center gap-1 text-success text-xs">
                            <ArrowUpRight className="w-3 h-3" />
                            High Demand
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-warning text-xs">
                            <ArrowDownRight className="w-3 h-3" />
                            Moderate Demand
                          </div>
                        )}
                      </div>
                      <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, analytics.demandRatio * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Sold: {analytics.sold.toLocaleString()}</span>
                        <span>{(analytics.demandRatio * 100).toFixed(1)}% filled</span>
                      </div>
                    </div>

                    {/* Performance Score */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-card border border-border/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Performance Score</p>
                          <p className="text-3xl font-bold text-foreground">{analytics.performanceScore}/100</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{analytics.performanceScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedBond(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
