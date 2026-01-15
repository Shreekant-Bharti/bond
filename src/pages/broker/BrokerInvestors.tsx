import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBondContext } from "@/context/BondContext";
import { Users, Search, TrendingUp, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// Generate masked investor data (non-confidential, aggregated)
function generateMaskedInvestors(transactions: any[], bonds: any[]) {
  const investorMap = new Map<string, { 
    maskedId: string;
    totalInvestment: number;
    bondsInvested: string[];
  }>();

  // Group transactions by investor
  transactions
    .filter(t => t.type === 'purchase' && t.fromId.startsWith('investor'))
    .forEach(t => {
      const existing = investorMap.get(t.fromId);
      const bondName = bonds.find(b => b.id === t.bondId)?.name || 'Unknown Bond';
      
      if (existing) {
        existing.totalInvestment += t.value;
        if (!existing.bondsInvested.includes(bondName)) {
          existing.bondsInvested.push(bondName);
        }
      } else {
        // Generate masked ID
        const maskedId = `INV-${t.fromId.slice(-3).toUpperCase()}***`;
        investorMap.set(t.fromId, {
          maskedId,
          totalInvestment: t.value,
          bondsInvested: [bondName],
        });
      }
    });

  // Add some dummy investors for demo purposes
  const dummyInvestors = [
    { maskedId: 'INV-A7B***', totalInvestment: 25000, bondsInvested: ['US Treasury 10Y', 'EU Sovereign 5Y'] },
    { maskedId: 'INV-C2D***', totalInvestment: 50000, bondsInvested: ['US Treasury 10Y'] },
    { maskedId: 'INV-E5F***', totalInvestment: 15000, bondsInvested: ['UK Gilt 7Y', 'Swiss Confederation 15Y'] },
    { maskedId: 'INV-G8H***', totalInvestment: 75000, bondsInvested: ['US Treasury 10Y', 'UK Gilt 7Y', 'EU Sovereign 5Y'] },
    { maskedId: 'INV-K3L***', totalInvestment: 30000, bondsInvested: ['Swiss Confederation 15Y'] },
    { maskedId: 'INV-M1N***', totalInvestment: 42000, bondsInvested: ['EU Sovereign 5Y', 'UK Gilt 7Y'] },
    { maskedId: 'INV-P9Q***', totalInvestment: 18500, bondsInvested: ['US Treasury 10Y'] },
    { maskedId: 'INV-R4S***', totalInvestment: 63000, bondsInvested: ['US Treasury 10Y', 'Swiss Confederation 15Y'] },
  ];

  return [...Array.from(investorMap.values()), ...dummyInvestors];
}

export default function BrokerInvestors() {
  const { transactions, bonds } = useBondContext();
  const [searchQuery, setSearchQuery] = useState('');

  const investors = useMemo(() => generateMaskedInvestors(transactions, bonds), [transactions, bonds]);

  const filteredInvestors = useMemo(() => {
    if (!searchQuery) return investors;
    const query = searchQuery.toLowerCase();
    return investors.filter(inv => 
      inv.maskedId.toLowerCase().includes(query) ||
      inv.bondsInvested.some(b => b.toLowerCase().includes(query))
    );
  }, [investors, searchQuery]);

  const totalInvestment = investors.reduce((acc, inv) => acc + inv.totalInvestment, 0);
  const avgInvestment = totalInvestment / investors.length || 0;

  return (
    <DashboardLayout title="Active Investors" subtitle="Aggregated investor activity (privacy-protected view)">
      <div className="space-y-6">
        {/* Privacy Notice */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-card border-primary/20 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Privacy-Protected View</p>
            <p className="text-xs text-muted-foreground">
              Investor identities are masked. Only aggregated, non-confidential data is displayed.
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investors</p>
                <p className="text-2xl font-bold text-foreground">{investors.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-success/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold text-foreground">${totalInvestment.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-secondary/5 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Investment</p>
                <p className="text-2xl font-bold text-foreground">${avgInvestment.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Investor ID or Bond Name..."
              className="pl-10 bg-muted/20 border-border/50"
            />
          </div>
        </Card>

        {/* Investors List */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Investor ID (Masked)</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Investment</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bonds Invested</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestors.map((investor, index) => (
                  <tr 
                    key={investor.maskedId + index}
                    className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-mono text-foreground">{investor.maskedId}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-success">${investor.totalInvestment.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {investor.bondsInvested.map((bond, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            {bond}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvestors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No investors found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
