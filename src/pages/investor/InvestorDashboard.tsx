import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { useBondContext } from "@/context/BondContext";
import { Wallet, TrendingUp, PiggyBank, Calendar, ArrowUpRight, Clock, AlertTriangle, CheckCircle, Newspaper, Shield, Landmark } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { yieldHistoryData } from "@/data/dummyData";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Upcoming bonds data
const upcomingBonds = [
  {
    id: 'upcoming-1',
    name: 'Green Infrastructure Bond 2025',
    expectedYield: 7.2,
    tenure: '7 Years',
    launchDate: '2025-03-15',
    description: 'Government-backed green bond for sustainable infrastructure development including renewable energy projects and eco-friendly transportation.',
    riskCategory: 'Low',
  },
  {
    id: 'upcoming-2',
    name: 'Digital India Sovereign Bond',
    expectedYield: 6.8,
    tenure: '5 Years',
    launchDate: '2025-04-01',
    description: 'Funding digital transformation initiatives across government services, including smart city development and digital literacy programs.',
    riskCategory: 'Low',
  },
  {
    id: 'upcoming-3',
    name: 'Rural Development Bond Series III',
    expectedYield: 7.5,
    tenure: '10 Years',
    launchDate: '2025-05-10',
    description: 'Supporting rural infrastructure, agricultural modernization, and community development projects across the nation.',
    riskCategory: 'Moderate',
  },
];

// Market updates data
const marketUpdates = [
  {
    icon: TrendingUp,
    title: 'Government Bond Yields',
    value: '6.5% - 7.8%',
    description: 'Current yield range for sovereign bonds',
  },
  {
    icon: Shield,
    title: 'Market Stability',
    value: 'Stable',
    description: 'Low volatility in fixed-income markets',
  },
  {
    icon: Newspaper,
    title: 'Policy Update',
    value: 'RBI Holds Rates',
    description: 'Repo rate unchanged at 6.5%',
  },
];

export default function InvestorDashboard() {
  const { investor } = useBondContext();
  const [selectedBond, setSelectedBond] = useState<typeof upcomingBonds[0] | null>(null);

  // Calculate investment health
  const getInvestmentHealth = () => {
    const returnRate = investor.totalInvested > 0 ? (investor.totalReturns / investor.totalInvested) * 100 : 0;
    const bondCount = investor.purchases.length;

    if (bondCount === 0) {
      return { status: 'Needs Attention', color: 'text-warning', bgColor: 'bg-warning/20', message: 'Start investing to build your portfolio' };
    } else if (returnRate >= 5 && bondCount >= 3) {
      return { status: 'Healthy', color: 'text-success', bgColor: 'bg-success/20', message: 'Well-diversified portfolio with strong returns' };
    } else if (returnRate >= 2 || bondCount >= 2) {
      return { status: 'Balanced', color: 'text-primary', bgColor: 'bg-primary/20', message: 'Good progress, consider diversifying further' };
    } else {
      return { status: 'Needs Attention', color: 'text-warning', bgColor: 'bg-warning/20', message: 'Consider adding more bonds to your portfolio' };
    }
  };

  const health = getInvestmentHealth();

  return (
    <DashboardLayout title="Investor Portfolio" subtitle="Track your bond investments and returns">
      {/* Portfolio Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <StatCard 
            title="Stablecoin Balance" 
            value={`$${investor.balance.toLocaleString()}`} 
            icon={<Wallet className="w-5 h-5" />} 
            trend={{ value: 2.4, isPositive: true }} 
          />
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <StatCard 
            title="Total Invested" 
            value={`$${investor.totalInvested.toLocaleString()}`} 
            icon={<PiggyBank className="w-5 h-5" />} 
          />
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <StatCard 
            title="Returns Earned" 
            value={`$${investor.totalReturns.toLocaleString()}`} 
            icon={<TrendingUp className="w-5 h-5" />} 
            trend={{ value: 4.2, isPositive: true }} 
          />
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <StatCard 
            title="Active Bonds" 
            value={investor.purchases.length} 
            icon={<Calendar className="w-5 h-5" />} 
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Yield Performance Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 hover:shadow-[0_0_40px_hsl(var(--primary)/0.1)] transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Yield Performance</h3>
              <p className="text-sm text-muted-foreground">Monthly returns overview</p>
            </div>
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              +12.4% this month
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={yieldHistoryData}>
              <defs>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="returns" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorReturns)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Investment Health Meter */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            {health.status === 'Healthy' ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : health.status === 'Balanced' ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning" />
            )}
            <h3 className="text-lg font-semibold text-foreground">Investment Health</h3>
          </div>

          <div className="text-center py-6">
            <div className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-full mb-4",
              health.bgColor
            )}>
              <span className={cn("text-xl font-bold", health.color)}>
                {health.status === 'Healthy' ? '✓' : health.status === 'Balanced' ? '~' : '!'}
              </span>
            </div>
            <h4 className={cn("text-2xl font-bold mb-2", health.color)}>
              {health.status}
            </h4>
            <p className="text-sm text-muted-foreground">
              {health.message}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Bonds</span>
              <span className="text-foreground font-medium">{investor.purchases.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Return Rate</span>
              <span className="text-foreground font-medium">
                {investor.totalInvested > 0 
                  ? ((investor.totalReturns / investor.totalInvested) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Government Bonds */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Landmark className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Upcoming Government Bonds</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingBonds.map((bond, index) => (
            <Card 
              key={bond.id}
              className="p-5 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedBond(bond)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-primary" />
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  bond.riskCategory === 'Low' ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                )}>
                  {bond.riskCategory} Risk
                </span>
              </div>
              <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {bond.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Yield</span>
                  <span className="text-success font-medium">{bond.expectedYield}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenure</span>
                  <span className="text-foreground">{bond.tenure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Launch Date</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(bond.launchDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Market Updates */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Current Market Updates</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {marketUpdates.map((update, index) => (
            <Card 
              key={index}
              className="p-5 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                  <update.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-medium text-foreground">{update.title}</h4>
              </div>
              <p className="text-xl font-bold text-primary mb-1">{update.value}</p>
              <p className="text-sm text-muted-foreground">{update.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bond Detail Dialog */}
      <Dialog open={!!selectedBond} onOpenChange={() => setSelectedBond(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              {selectedBond?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBond && (
            <div className="space-y-6">
              <p className="text-muted-foreground">{selectedBond.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-1">Expected Yield</p>
                  <p className="text-xl font-bold text-success">{selectedBond.expectedYield}%</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-1">Tenure</p>
                  <p className="text-xl font-bold text-foreground">{selectedBond.tenure}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-1">Launch Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(selectedBond.launchDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-1">Risk Category</p>
                  <p className={cn(
                    "text-lg font-semibold",
                    selectedBond.riskCategory === 'Low' ? "text-success" : "text-warning"
                  )}>
                    {selectedBond.riskCategory}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Coming Soon</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This bond will be available for investment starting {new Date(selectedBond.launchDate).toLocaleDateString()}. 
                  Check back then to participate.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}