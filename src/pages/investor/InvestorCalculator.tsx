import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { Calculator, TrendingUp, Calendar, DollarSign, PiggyBank, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";

export default function InvestorCalculator() {
  const { bonds } = useBondContext();
  const [selectedBondId, setSelectedBondId] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [durationUnit, setDurationUnit] = useState<'years' | 'months'>('years');
  const [manualYield, setManualYield] = useState<string>("");
  const [calculated, setCalculated] = useState(false);

  const availableBonds = bonds.filter(b => b.status === 'listed' || b.status === 'available');
  const selectedBond = bonds.find(b => b.id === selectedBondId);

  const effectiveYield = selectedBond ? selectedBond.yield : (parseFloat(manualYield) || 0);
  const amount = parseFloat(investmentAmount) || 0;
  const durationInYears = durationUnit === 'years' ? parseFloat(duration) || 0 : (parseFloat(duration) || 0) / 12;

  // Calculate returns
  const interestEarned = (amount * effectiveYield * durationInYears) / 100;
  const maturityValue = amount + interestEarned;
  const totalReturns = maturityValue;

  const handleCalculate = () => {
    if (amount > 0 && durationInYears > 0 && effectiveYield > 0) {
      setCalculated(true);
    }
  };

  const handleReset = () => {
    setSelectedBondId("");
    setInvestmentAmount("");
    setDuration("");
    setManualYield("");
    setCalculated(false);
  };

  return (
    <DashboardLayout title="Returns Calculator" subtitle="Estimate your investment returns">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Calculator Card */}
        <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Investment Returns Calculator</h3>
              <p className="text-sm text-muted-foreground">Calculate potential earnings on your bond investments</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-5">
              {/* Bond Selection */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Select Bond (Optional)</label>
                <select
                  value={selectedBondId}
                  onChange={(e) => {
                    setSelectedBondId(e.target.value);
                    setManualYield("");
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                >
                  <option value="">-- Select a bond or enter manually --</option>
                  {availableBonds.map(bond => (
                    <option key={bond.id} value={bond.id}>
                      {bond.name} - {bond.yield}% yield
                    </option>
                  ))}
                </select>
              </div>

              {/* Investment Amount */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Investment Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    placeholder="Enter amount"
                    min="0"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Duration</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      placeholder="Duration"
                      min="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDurationUnit('years')}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        durationUnit === 'years' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Years
                    </button>
                    <button
                      onClick={() => setDurationUnit('months')}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        durationUnit === 'months' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Months
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual Yield (if no bond selected) */}
              {!selectedBondId && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Annual Yield (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={manualYield}
                      onChange={(e) => setManualYield(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      placeholder="Enter yield %"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              )}

              {/* Selected Bond Info */}
              {selectedBond && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Selected Bond</p>
                  <p className="font-semibold text-foreground">{selectedBond.name}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">Yield: <span className="text-success font-medium">{selectedBond.yield}%</span></span>
                    <span className="text-muted-foreground">Tenure: <span className="text-foreground">{selectedBond.tenure} months</span></span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <GradientButton 
                  className="flex-1"
                  onClick={handleCalculate}
                  disabled={!amount || !durationInYears || !effectiveYield}
                >
                  Calculate Returns
                </GradientButton>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted transition-all duration-300"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground mb-4">Estimated Returns</h4>
              
              {calculated ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3 mb-2">
                      <PiggyBank className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Principal Amount</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">${amount.toLocaleString()}</p>
                  </div>

                  <div className="p-5 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <p className="text-sm text-muted-foreground">Interest Earned</p>
                    </div>
                    <p className="text-2xl font-bold text-success">+${interestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground mt-1">@ {effectiveYield}% p.a. for {durationInYears.toFixed(1)} years</p>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Maturity Value</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">${maturityValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total at end of term</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/10 border border-border/20 text-center">
                    <p className="text-xs text-muted-foreground">
                      * This is an estimate based on simple interest calculation. Actual returns may vary.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Calculator className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Enter investment details to see estimated returns</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-gradient-to-br from-card/60 to-card/30 border-border/50">
          <h4 className="font-semibold text-foreground mb-3">How it works</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium mt-0.5">1</span>
              Select a bond from available listings or enter yield manually
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium mt-0.5">2</span>
              Enter your investment amount and duration
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium mt-0.5">3</span>
              View estimated returns, interest earned, and maturity value
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
