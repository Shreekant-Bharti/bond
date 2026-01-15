import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { BondCard } from "@/components/ui/bond-card";
import { TransactionItem } from "@/components/ui/transaction-item";
import { useBondContext } from "@/context/BondContext";
import { TrendingUp, FileText, Users, DollarSign, ArrowRight, Activity, BarChart3 } from "lucide-react";

export default function BrokerDashboard() {
  const navigate = useNavigate();
  const { broker, bonds, transactions } = useBondContext();
  const availableBonds = bonds.filter(b => b.status === 'available');
  const listedBonds = bonds.filter(b => broker.listedBonds.includes(b.id));
  const recentTx = transactions.filter(t => t.toId === broker.id || t.fromId === broker.id).slice(-5).reverse();

  // Activity metrics
  const todayListings = 3;
  const pendingDemands = 34;

  return (
    <DashboardLayout title="Lister Dashboard" subtitle="Manage bond listings and investor demand">
      {/* Stats with listing-focused design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/broker/listings')}
          className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-card p-5 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300 group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
          <FileText className="w-5 h-5 text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Listed Bonds</p>
          <p className="text-3xl font-bold text-foreground mt-1">{broker.totalListings}</p>
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{todayListings} today
          </p>
          <p className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view details →</p>
        </div>
        
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-success/5 to-card p-5 hover:shadow-[0_0_30px_hsl(var(--success)/0.15)] transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-success/20 to-transparent rounded-bl-full" />
          <DollarSign className="w-5 h-5 text-success mb-3" />
          <p className="text-sm text-muted-foreground">Transaction Volume</p>
          <p className="text-3xl font-bold text-foreground mt-1">${(broker.transactionVolume / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.5% this week
          </p>
        </div>
        
        <div 
          onClick={() => navigate('/broker/investors')}
          className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary/5 to-card p-5 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.15)] transition-all duration-300 group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-secondary/20 to-transparent rounded-bl-full" />
          <Users className="w-5 h-5 text-secondary mb-3" />
          <p className="text-sm text-muted-foreground">Active Investors</p>
          <p className="text-3xl font-bold text-foreground mt-1">1,247</p>
          <p className="text-xs text-muted-foreground mt-2">Across all listings</p>
          <p className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view details →</p>
        </div>
        
        <div 
          onClick={() => navigate('/broker/demand')}
          className="relative overflow-hidden rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 to-card p-5 hover:shadow-[0_0_30px_hsl(var(--warning)/0.15)] transition-all duration-300 group animate-pulse-slow cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-warning/20 to-transparent rounded-bl-full" />
          <Activity className="w-5 h-5 text-warning mb-3" />
          <p className="text-sm text-muted-foreground">Pending Demands</p>
          <p className="text-3xl font-bold text-foreground mt-1">{pendingDemands}</p>
          <p className="text-xs text-warning mt-2">Requires attention</p>
          <p className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view details →</p>
        </div>
      </div>

      {/* Main content - Two column listing flow */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available from FI */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">From Financial Institutions</h3>
                <p className="text-sm text-muted-foreground">Bonds ready to list</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
              {availableBonds.length} available
            </span>
          </div>
          <div className="space-y-4">
            {availableBonds.length > 0 ? availableBonds.map((bond, index) => (
              <div 
                key={bond.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <BondCard 
                  name={bond.name} 
                  issuer={bond.issuer} 
                  yield={bond.yield} 
                  tenure={bond.tenure} 
                  value={bond.value} 
                  minInvestment={bond.minInvestment} 
                  availableSupply={bond.availableSupply} 
                  status={bond.status} 
                  actionLabel="Create Listing" 
                  onAction={() => navigate('/broker/create')} 
                />
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">All bonds are listed</p>
                <p className="text-sm mt-1">Wait for new issuances from FIs</p>
              </div>
            )}
          </div>
        </div>

        {/* Currently Listed */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/40 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Currently Listed</h3>
                <p className="text-sm text-muted-foreground">Active on marketplace</p>
              </div>
            </div>
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full font-medium">
              {listedBonds.length} live
            </span>
          </div>
          <div className="space-y-4">
            {listedBonds.length > 0 ? listedBonds.slice(0, 4).map((bond, index) => (
              <div 
                key={bond.id}
                onClick={() => navigate('/broker/listings')}
                className="p-4 rounded-xl bg-card/60 border border-border/30 hover:border-success/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{bond.name}</p>
                    <p className="text-sm text-muted-foreground">{bond.issuer}</p>
                  </div>
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">Listed</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/30 text-xs">
                  <div>
                    <p className="text-muted-foreground">Yield</p>
                    <p className="font-medium text-success">{bond.yield}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-medium text-foreground">{bond.availableSupply.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium text-foreground">${bond.value}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No bonds listed yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
          <div className="space-y-3">
            {recentTx.length > 0 ? recentTx.map((tx) => (
              <TransactionItem 
                key={tx.id} 
                type={tx.type} 
                description={tx.description} 
                amount={tx.amount} 
                value={tx.value} 
                timestamp={tx.timestamp} 
                status={tx.status} 
              />
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}