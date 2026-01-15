import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { Wallet, TrendingUp, PiggyBank, Calendar, Coins, ChevronDown, Store, CheckCircle2, Loader2, X, AlertTriangle, Info } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { calculateFairMarketValue, BondPricingResult } from "@/lib/bondPricing";

type SellStep = 'idle' | 'form' | 'processing' | 'success';

export default function InvestorPortfolio() {
  const { investor, getBondById, listBondForSale, secondaryMarketListings } = useBondContext();
  const { toast } = useToast();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [sellStep, setSellStep] = useState<SellStep>('idle');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [sellQuantity, setSellQuantity] = useState<string>("");
  const [pricingResult, setPricingResult] = useState<BondPricingResult | null>(null);

  const toggleCard = (purchaseId: string) => {
    setExpandedCard(expandedCard === purchaseId ? null : purchaseId);
  };

  const isListedForSale = (purchaseId: string) => {
    return secondaryMarketListings.some(
      l => l.purchaseId === purchaseId && l.status === 'listed'
    );
  };

  const handleSellClick = (purchaseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const purchase = investor.purchases.find(p => p.id === purchaseId);
    const bond = purchase ? getBondById(purchase.bondId) : null;
    
    if (purchase && bond) {
      setSelectedPurchaseId(purchaseId);
      setSellQuantity(purchase.amount.toString());
      
      // Calculate fair market value based on time to maturity
      const pricing = calculateFairMarketValue({
        faceValue: purchase.purchasePrice,
        couponRate: bond.yield,
        purchaseDate: purchase.purchaseDate,
        maturityDate: purchase.maturityDate,
      });
      
      setPricingResult(pricing);
      setSellStep('form');
    }
  };

  // Recalculate price when quantity changes
  useEffect(() => {
    if (selectedPurchaseId && sellQuantity) {
      const purchase = investor.purchases.find(p => p.id === selectedPurchaseId);
      const bond = purchase ? getBondById(purchase.bondId) : null;
      
      if (purchase && bond) {
        const quantity = parseInt(sellQuantity) || 0;
        const ratio = quantity / purchase.amount;
        const proportionalValue = purchase.purchasePrice * ratio;
        
        const pricing = calculateFairMarketValue({
          faceValue: proportionalValue,
          couponRate: bond.yield,
          purchaseDate: purchase.purchaseDate,
          maturityDate: purchase.maturityDate,
        });
        
        setPricingResult(pricing);
      }
    }
  }, [sellQuantity, selectedPurchaseId, investor.purchases, getBondById]);

  const handleConfirmSell = async () => {
    if (!selectedPurchaseId || !pricingResult) return;

    const quantity = parseInt(sellQuantity) || 0;

    if (quantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    setSellStep('processing');

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Use the fair market value (discounted price) - no manual override
    const result = listBondForSale(selectedPurchaseId, quantity, pricingResult.fairMarketValue);

    if (result.success) {
      setSellStep('success');
    } else {
      toast({
        title: "Failed to List",
        description: result.error,
        variant: "destructive",
      });
      setSellStep('idle');
    }
  };

  const handleCloseSellModal = () => {
    setSellStep('idle');
    setSelectedPurchaseId(null);
    setSellQuantity("");
    setPricingResult(null);
  };

  const selectedPurchase = selectedPurchaseId 
    ? investor.purchases.find(p => p.id === selectedPurchaseId) 
    : null;
  const selectedBond = selectedPurchase ? getBondById(selectedPurchase.bondId) : null;

  return (
    <DashboardLayout title="My Portfolio" subtitle="Track your bond investments and holdings">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <StatCard 
            title="Stablecoin Balance" 
            value={`$${investor.balance.toLocaleString()}`} 
            icon={<Wallet className="w-5 h-5" />} 
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
            title="Expected Returns" 
            value={`$${investor.totalReturns.toLocaleString()}`} 
            icon={<TrendingUp className="w-5 h-5" />} 
            trend={{ value: 4.2, isPositive: true }} 
          />
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <StatCard 
            title="Active Holdings" 
            value={investor.purchases.filter(p => p.status === 'active').length} 
            icon={<Calendar className="w-5 h-5" />} 
          />
        </div>
      </div>

      {/* Holdings List */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Coins className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Bond Holdings</h3>
        </div>

        {investor.purchases.length > 0 ? (
          <div className="space-y-4">
            {investor.purchases.map((purchase) => {
              const bond = getBondById(purchase.bondId);
              const isExpanded = expandedCard === purchase.id;
              const isListed = isListedForSale(purchase.id);
              
              return bond ? (
                <div 
                  key={purchase.id} 
                  className={`rounded-xl bg-muted/20 border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isExpanded 
                      ? 'border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.15)]' 
                      : 'border-border/30 hover:border-primary/30 hover:bg-muted/30'
                  }`}
                  onClick={() => toggleCard(purchase.id)}
                >
                  {/* Compact Card (Always Visible) */}
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                          <Coins className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">{bond.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{bond.issuer}</p>
                            {isListed && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning font-medium">
                                Listed for Sale
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Invested</p>
                          <p className="font-semibold text-foreground">${purchase.purchasePrice.toLocaleString()}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-muted-foreground">Returns</p>
                          <p className="font-semibold text-success">+${purchase.expectedReturn.toFixed(2)}</p>
                        </div>
                        <div className={`p-2 rounded-full bg-muted/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded 
                        ? 'grid-rows-[1fr] opacity-100' 
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-0 border-t border-border/30">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-5">
                          <div className="p-3 rounded-lg bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1">Bond Name</p>
                            <p className="text-foreground font-medium">{bond.name}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                            <p className="text-foreground font-medium">{purchase.amount} units</p>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1">Invested Amount</p>
                            <p className="text-foreground font-medium">${purchase.purchasePrice.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-success/10">
                            <p className="text-xs text-muted-foreground mb-1">Returns Earned</p>
                            <p className="text-success font-medium">+${purchase.expectedReturn.toFixed(2)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1">Maturity Date</p>
                            <p className="text-foreground font-medium">{purchase.maturityDate}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-primary/10">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="text-primary font-medium capitalize">{purchase.status}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                          <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Purchase Date</p>
                              <p className="text-foreground font-medium">{purchase.purchaseDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Annual Yield</p>
                              <p className="text-primary font-bold text-lg">{bond.yield}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Tenure</p>
                              <p className="text-foreground font-medium">{bond.tenure} months</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total Value at Maturity</p>
                              <p className="text-success font-bold text-lg">
                                ${(purchase.purchasePrice + purchase.expectedReturn).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sell Bond Button */}
                        {purchase.status === 'active' && !isListed && (
                          <div className="mt-4">
                            <button
                              onClick={(e) => handleSellClick(purchase.id, e)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-all duration-300"
                            >
                              <Store className="w-4 h-4" />
                              Sell on Secondary Market
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No investments yet</p>
            <p className="text-sm mt-2">Browse available bonds to start investing</p>
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {sellStep !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 animate-scale-in">
            {/* Form Step */}
            {sellStep === 'form' && selectedPurchase && selectedBond && pricingResult && (
              <div className="rounded-2xl border border-border/50 bg-card p-8 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={handleCloseSellModal}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Store className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Sell Bond Before Maturity</h3>
                    <p className="text-sm text-muted-foreground">Fair Market Value Pricing Applied</p>
                  </div>
                </div>

                {/* Warning Banner */}
                {pricingResult.isBeforeMaturity && (
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-warning text-sm">Early Sale Notice</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Selling before maturity applies a fair market discount. 
                          You will not receive future interest payments.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-muted/20 border border-border/30 mb-6">
                  <p className="font-semibold text-foreground">{selectedBond.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBond.issuer}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Owned: </span>
                      <span className="text-foreground font-medium">{selectedPurchase.amount} units</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Maturity: </span>
                      <span className="text-foreground font-medium">{selectedPurchase.maturityDate}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-2 block">Quantity to Sell</label>
                  <input
                    type="number"
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    max={selectedPurchase.amount}
                    min="1"
                  />
                </div>

                {/* Pricing Breakdown */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 border border-border/30 mb-6 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Fair Market Value Calculation</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Investment</span>
                    <span className="text-foreground font-medium">${pricingResult.originalValue.toLocaleString()}</span>
                  </div>
                  
                  {pricingResult.isBeforeMaturity && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Days Until Maturity</span>
                        <span className="text-foreground">{pricingResult.daysUntilMaturity} days</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining Periods</span>
                        <span className="text-foreground">{pricingResult.remainingPeriods}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Interest Forfeited</span>
                        <span>-${pricingResult.forfeitedInterest.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Discount Applied ({pricingResult.discountPercentage.toFixed(1)}%)</span>
                        <span>-${pricingResult.discountAmount.toLocaleString()}</span>
                      </div>
                      
                      <div className="h-px bg-border/50 my-2" />
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Secondary Market Price</span>
                    <span className="text-xl font-bold text-primary">${pricingResult.fairMarketValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notice */}
                <div className="p-3 rounded-lg bg-muted/10 mb-6">
                  <p className="text-xs text-muted-foreground text-center">
                    This price is calculated using the fair market value formula. 
                    Manual price override is not available to ensure market integrity.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseSellModal}
                    className="flex-1 px-6 py-3 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <GradientButton className="flex-1" onClick={handleConfirmSell}>
                    List at ${pricingResult.fairMarketValue.toLocaleString()}
                  </GradientButton>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {sellStep === 'processing' && (
              <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Listing Bond...</h3>
                <p className="text-muted-foreground">Please wait while we process your request</p>
              </div>
            )}

            {/* Success Step */}
            {sellStep === 'success' && pricingResult && (
              <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Listed Successfully!</h3>
                <p className="text-muted-foreground mb-2">
                  Your bond is now listed on the Secondary Market
                </p>
                {pricingResult.isBeforeMaturity && (
                  <p className="text-xs text-warning mb-4">
                    Sold before maturity (discount applied)
                  </p>
                )}
                <div className="p-4 rounded-xl bg-muted/20 mb-6">
                  <p className="text-sm text-muted-foreground">Listing Price</p>
                  <p className="text-2xl font-bold text-primary">${pricingResult.fairMarketValue.toLocaleString()}</p>
                </div>
                <GradientButton className="w-full" onClick={handleCloseSellModal}>
                  Done
                </GradientButton>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
