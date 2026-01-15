import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { GlowCard } from "@/components/ui/glow-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { BondCard } from "@/components/ui/bond-card";
import { useBondContext } from "@/context/BondContext";
import { Building2, DollarSign, TrendingUp, Plus, X, Layers, BarChart3, Settings } from "lucide-react";

export default function FIDashboard() {
  const { financialInstitution, bonds, createBond, custodian } = useBondContext();
  const issuedBonds = bonds.filter(b => financialInstitution.issuedBonds.includes(b.id));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    issuer: financialInstitution.name, 
    yield: 4, 
    tenure: 60, 
    value: 5000, 
    minInvestment: 1, // Minimum $1 investment
    totalSupply: 100000, 
    description: '' 
  });

  const handleCreate = () => {
    createBond({
      ...form,
      availableSupply: form.totalSupply,
      maturityDate: new Date(Date.now() + form.tenure * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      custodianId: custodian.id,
    });
    setShowForm(false);
    setForm({ name: '', issuer: financialInstitution.name, yield: 4, tenure: 60, value: 5000, minInvestment: 1, totalSupply: 100000, description: '' });
  };

  const avgYield = issuedBonds.length > 0 
    ? (issuedBonds.reduce((acc, b) => acc + b.yield, 0) / issuedBonds.length).toFixed(2)
    : '0.00';

  const inputClass = "w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300";

  return (
    <DashboardLayout
      title="Bond Issuance Center"
      subtitle="Issue and manage government bond offerings"
      actions={
        <GradientButton 
          onClick={() => setShowForm(true)}
          className="hover:scale-[1.02] transition-transform duration-300"
        >
          <Plus className="w-4 h-4" /> Issue New Bond
        </GradientButton>
      }
    >
      {/* Control Panel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 p-5 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium">Issuance</span>
          </div>
          <p className="text-sm text-muted-foreground">Bonds Issued</p>
          <p className="text-3xl font-bold text-foreground mt-1">{financialInstitution.issuedBonds.length}</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-success/10 via-card to-card border border-success/20 p-5 hover:shadow-[0_0_30px_hsl(var(--success)/0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full font-medium">Value</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Issued Value</p>
          <p className="text-3xl font-bold text-foreground mt-1">${(financialInstitution.totalIssuedValue / 1000000).toFixed(1)}M</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-secondary/10 via-card to-card border border-secondary/20 p-5 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xs text-secondary bg-secondary/10 px-2 py-1 rounded-full font-medium">Supply</span>
          </div>
          <p className="text-sm text-muted-foreground">Active Supply</p>
          <p className="text-3xl font-bold text-foreground mt-1">{financialInstitution.activeSupply.toLocaleString()}</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-warning/10 via-card to-card border border-warning/20 p-5 hover:shadow-[0_0_30px_hsl(var(--warning)/0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full font-medium">Yield</span>
          </div>
          <p className="text-sm text-muted-foreground">Avg. Yield Rate</p>
          <p className="text-3xl font-bold text-foreground mt-1">{avgYield}%</p>
        </div>
      </div>

      {/* Create Bond Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Issue New Bond</h3>
                  <p className="text-sm text-muted-foreground">Create a new government bond offering</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Bond Name</label>
                <input 
                  placeholder="e.g., 5 Year Treasury Bond" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Issuer</label>
                <input 
                  placeholder="Issuing Institution" 
                  value={form.issuer} 
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Yield Rate (%)</label>
                <input 
                  type="number" 
                  placeholder="4.0" 
                  value={form.yield} 
                  onChange={(e) => setForm({ ...form, yield: +e.target.value })} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tenure (months)</label>
                <input 
                  type="number" 
                  placeholder="60" 
                  value={form.tenure} 
                  onChange={(e) => setForm({ ...form, tenure: +e.target.value })} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Value per Unit ($)</label>
                <input 
                  type="number" 
                  placeholder="5000" 
                  value={form.value} 
                  onChange={(e) => setForm({ ...form, value: +e.target.value })} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Total Supply</label>
                <input 
                  type="number" 
                  placeholder="100000" 
                  value={form.totalSupply} 
                  onChange={(e) => setForm({ ...form, totalSupply: +e.target.value })} 
                  className={inputClass} 
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6 pt-4 border-t border-border">
              <GradientButton onClick={handleCreate} className="flex-1 hover:scale-[1.02] transition-transform">
                <Plus className="w-4 h-4" /> Create Bond
              </GradientButton>
              <GradientButton variant="outline" onClick={() => setShowForm(false)} className="hover:scale-[1.02] transition-transform">
                Cancel
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* Issued Bonds Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Managed Bonds</h3>
          </div>
          <span className="text-sm text-muted-foreground">{issuedBonds.length} bonds issued</span>
        </div>
        
        {issuedBonds.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issuedBonds.map((bond, index) => (
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
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/5">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Bonds Issued Yet</h4>
            <p className="text-muted-foreground mb-6">Create your first government bond offering</p>
            <GradientButton onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Issue First Bond
            </GradientButton>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}