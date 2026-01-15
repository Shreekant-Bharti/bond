import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { Landmark, DollarSign, Users, Shield, TrendingUp, Eye, Lock, Activity, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function GovDashboard() {
  const { complianceMetrics, bonds, transactions } = useBondContext();

  const bondDistribution = bonds.map(b => ({ 
    name: b.name.split(' ').slice(0, 2).join(' '), 
    value: b.totalSupply - b.availableSupply,
    total: b.totalSupply
  }));
  const COLORS = ['hsl(175, 80%, 50%)', 'hsl(260, 60%, 55%)', 'hsl(200, 80%, 60%)', 'hsl(145, 70%, 45%)', 'hsl(40, 90%, 55%)'];

  const txByType = [
    { type: 'Purchases', count: transactions.filter(t => t.type === 'purchase').length },
    { type: 'Listings', count: transactions.filter(t => t.type === 'listing').length },
    { type: 'Issuances', count: transactions.filter(t => t.type === 'issuance').length },
    { type: 'Settlements', count: transactions.filter(t => t.type === 'settlement').length },
  ];

  return (
    <DashboardLayout title="Government Oversight Portal" subtitle="Transparency and compliance monitoring">
      {/* Read-only indicator */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-muted/30 border border-border w-fit">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Read-Only Access</span>
        <Lock className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Oversight Stats - Calm, authoritative style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-card p-6 hover:bg-card/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Bonds</p>
              <p className="text-3xl font-bold text-foreground">{complianceMetrics.totalBondsIssued}</p>
              <p className="text-sm text-muted-foreground mt-1">Issued nationally</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 hover:bg-card/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Issued Value</p>
              <p className="text-3xl font-bold text-foreground">${(complianceMetrics.totalValueIssued / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground mt-1">Total market value</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 hover:bg-card/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Investments</p>
              <p className="text-3xl font-bold text-foreground">${complianceMetrics.totalInvestments.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Capital deployed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 hover:bg-card/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Investors</p>
              <p className="text-3xl font-bold text-foreground">{complianceMetrics.activeInvestors.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Registered users</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center">
              <Users className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts - Clean monitoring view */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Bond Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={bondDistribution} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {bondDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-semibold text-foreground">Transaction Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={txByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance Metrics - Authoritative cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/5 to-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Compliance Score</h4>
              <p className="text-xs text-muted-foreground">System-wide rating</p>
            </div>
          </div>
          <p className="text-5xl font-bold text-success">{complianceMetrics.complianceScore}%</p>
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-1000"
                style={{ width: `${complianceMetrics.complianceScore}%` }}
              />
            </div>
            <p className="text-sm text-success mt-2">Excellent standing</p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Settlements Today</h4>
              <p className="text-xs text-muted-foreground">24-hour activity</p>
            </div>
          </div>
          <p className="text-5xl font-bold text-foreground">{complianceMetrics.settlementsToday}</p>
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-sm text-success flex items-center gap-1">
              <Shield className="w-3 h-3" /> All verified
            </p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Audits Passed</h4>
              <p className="text-xs text-muted-foreground">Historical record</p>
            </div>
          </div>
          <p className="text-5xl font-bold text-foreground">{complianceMetrics.auditsPassed}</p>
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">100% success rate</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}