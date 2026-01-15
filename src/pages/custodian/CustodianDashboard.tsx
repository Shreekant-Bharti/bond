import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { TransactionItem } from "@/components/ui/transaction-item";
import { useBondContext } from "@/context/BondContext";
import { Shield, DollarSign, FileCheck, Users, CheckCircle2, Clock, AlertCircle, Lock } from "lucide-react";

export default function CustodianDashboard() {
  const { custodian, bonds, transactions, investor } = useBondContext();
  const custodyBonds = bonds.filter(b => custodian.bondsInCustody.includes(b.id));
  const pendingSettlements = transactions.filter(t => t.type === 'settlement' && t.status === 'pending');
  const recentSettlements = transactions.filter(t => t.type === 'settlement' || t.type === 'purchase').slice(-5).reverse();

  return (
    <DashboardLayout title="Custodian Control Center" subtitle="Verify holdings and manage settlements">
      {/* Verification-focused stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative rounded-xl border-2 border-primary/30 bg-card p-5 hover:border-primary/50 transition-all duration-300">
          <div className="absolute -top-3 left-4 bg-card px-2">
            <span className="text-xs font-medium text-primary">CUSTODY</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mt-2">Bonds in Custody</p>
              <p className="text-3xl font-bold text-foreground mt-1">{custodian.bondsInCustody.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="relative rounded-xl border-2 border-success/30 bg-card p-5 hover:border-success/50 transition-all duration-300">
          <div className="absolute -top-3 left-4 bg-card px-2">
            <span className="text-xs font-medium text-success">VALUE</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mt-2">Total Custody Value</p>
              <p className="text-3xl font-bold text-foreground mt-1">${(custodian.totalCustodyValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
        
        <div className="relative rounded-xl border-2 border-secondary/30 bg-card p-5 hover:border-secondary/50 transition-all duration-300">
          <div className="absolute -top-3 left-4 bg-card px-2">
            <span className="text-xs font-medium text-secondary">PROCESSED</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mt-2">Settlements Processed</p>
              <p className="text-3xl font-bold text-foreground mt-1">{custodian.settlementsProcessed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
        
        <div className={`relative rounded-xl border-2 ${pendingSettlements.length > 0 ? 'border-warning/50 animate-pulse' : 'border-border/50'} bg-card p-5 transition-all duration-300`}>
          <div className="absolute -top-3 left-4 bg-card px-2">
            <span className={`text-xs font-medium ${pendingSettlements.length > 0 ? 'text-warning' : 'text-muted-foreground'}`}>PENDING</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mt-2">Pending Verifications</p>
              <p className="text-3xl font-bold text-foreground mt-1">{pendingSettlements.length}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${pendingSettlements.length > 0 ? 'bg-warning/10' : 'bg-muted/10'} flex items-center justify-center`}>
              <Clock className={`w-6 h-6 ${pendingSettlements.length > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Audit-style layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Holdings Under Custody */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <Lock className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Holdings Under Custody</h3>
              <p className="text-sm text-muted-foreground">Verified and secured assets</p>
            </div>
          </div>
          <div className="space-y-4">
            {custodyBonds.map((bond, index) => (
              <div 
                key={bond.id}
                className="rounded-xl border border-border bg-muted/10 p-4 hover:bg-muted/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{bond.name}</h4>
                    <p className="text-sm text-muted-foreground">{bond.issuer}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-success/10 text-success border border-success/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-2 rounded-lg bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Supply</p>
                    <p className="font-semibold text-foreground mt-1">{bond.totalSupply.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Available</p>
                    <p className="font-semibold text-foreground mt-1">{bond.availableSupply.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Unit Value</p>
                    <p className="font-semibold text-foreground mt-1">${bond.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investor Ownership Records */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-secondary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Ownership Records</h3>
                <p className="text-sm text-muted-foreground">Investor holdings (Read-Only)</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          </div>
          <div className="space-y-3">
            {investor.purchases.length > 0 ? investor.purchases.map((p) => {
              const bond = bonds.find(b => b.id === p.bondId);
              return (
                <div 
                  key={p.id} 
                  className="flex justify-between items-center p-4 rounded-xl bg-muted/10 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{investor.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{bond?.name}</p>
                      <p className="text-xs text-muted-foreground">{investor.name} • {investor.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground text-sm">{p.amount} units</p>
                    <p className="text-xs text-muted-foreground">${p.purchasePrice.toLocaleString()}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No ownership records yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Settlements */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <FileCheck className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Settlement History</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-3">
            {recentSettlements.length > 0 ? recentSettlements.map((tx) => (
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
                <p>No settlement history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}