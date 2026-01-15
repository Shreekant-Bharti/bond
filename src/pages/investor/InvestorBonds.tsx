import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import {
  TrendingUp,
  Search,
  Filter,
  X,
  ShoppingCart,
  Clock,
  Percent,
  DollarSign,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Bond } from "@/types/bond";
import { GradientButton } from "@/components/ui/gradient-button";

type BuyStep = "details" | "quantity" | "confirm" | "processing" | "success";

export default function InvestorBonds() {
  const { bonds, purchaseBond, investor } = useBondContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [buyStep, setBuyStep] = useState<BuyStep>("details");
  const [quantity, setQuantity] = useState(1);

  // Only show bonds that are listed AND approved
  const listedBonds = bonds.filter(
    (b) => b.status === "listed" && b.approvalStatus === "approved"
  );

  const filteredBonds = listedBonds.filter(
    (bond) =>
      bond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bond.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBondClick = (bond: Bond) => {
    setSelectedBond(bond);
    setBuyStep("details");
    setQuantity(1);
  };

  const handleCloseModal = () => {
    setSelectedBond(null);
    setBuyStep("details");
    setQuantity(1);
  };

  const totalCost = selectedBond ? quantity * selectedBond.minInvestment : 0;
  const expectedReturn = selectedBond
    ? totalCost * (selectedBond.yield / 100) * (selectedBond.tenure / 12)
    : 0;

  const handleConfirmPurchase = () => {
    if (!selectedBond) return;

    if (investor.balance < totalCost) {
      toast({
        title: "Insufficient Balance",
        description:
          "Please add more stablecoins to your wallet to complete this purchase.",
        variant: "destructive",
      });
      return;
    }

    setBuyStep("processing");

    // Simulate processing time (3-4 seconds)
    setTimeout(() => {
      purchaseBond(selectedBond.id, quantity);
      setBuyStep("success");

      // Auto-close after success
      setTimeout(() => {
        handleCloseModal();
        toast({
          title: "Purchase Successful",
          description: `You've successfully purchased ${quantity} units of ${selectedBond.name}`,
        });
      }, 2000);
    }, 3500);
  };

  return (
    <DashboardLayout
      title="Available Bonds"
      subtitle="Government-backed securities ready for investment"
    >
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bonds by name or issuer..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/60 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card/60 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>{filteredBonds.length} bonds available</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-sm text-muted-foreground">
          Your Balance:{" "}
          <span className="text-foreground font-medium">
            ${investor.balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bond Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBonds.map((bond, index) => (
          <div
            key={bond.id}
            className="animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => handleBondClick(bond)}
          >
            <div className="p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                    {bond.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{bond.issuer}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                  {bond.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Yield</p>
                  <p className="text-foreground font-medium text-primary">
                    {bond.yield}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tenure</p>
                  <p className="text-foreground font-medium">
                    {bond.tenure} months
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min Investment</p>
                  <p className="text-foreground font-medium">
                    ${bond.minInvestment}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available</p>
                  <p className="text-foreground font-medium">
                    {bond.availableSupply} units
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <ShoppingCart className="w-4 h-4" />
                Click to view & buy
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBonds.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-border/50 bg-card/30">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            No bonds found matching your search.
          </p>
        </div>
      )}

      {/* Bond Detail Modal */}
      {selectedBond && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-6 shadow-2xl animate-scale-in">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step: Bond Details */}
            {buyStep === "details" && (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedBond.name}
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  {selectedBond.issuer}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Percent className="w-4 h-4" />
                      <span className="text-sm">Annual Yield</span>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {selectedBond.yield}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Tenure</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {selectedBond.tenure} months
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Min Investment</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      ${selectedBond.minInvestment}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Available</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {selectedBond.availableSupply} units
                    </p>
                  </div>
                </div>

                <GradientButton
                  onClick={() => setBuyStep("quantity")}
                  className="w-full"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Bond
                </GradientButton>
              </div>
            )}

            {/* Step: Quantity Selection */}
            {buyStep === "quantity" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Select Quantity
                </h2>
                <p className="text-muted-foreground mb-6">
                  {selectedBond.name}
                </p>

                <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Number of Bond Units
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-muted hover:border-primary/50 transition-all text-xl font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="flex-1 px-4 py-3 rounded-xl bg-input border border-border text-foreground text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="1"
                      max={selectedBond.availableSupply}
                    />
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedBond.availableSupply, quantity + 1)
                        )
                      }
                      className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-muted hover:border-primary/50 transition-all text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Max available: {selectedBond.availableSupply} units
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="text-2xl font-bold text-primary">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span
                      className={
                        investor.balance >= totalCost
                          ? "text-success"
                          : "text-destructive"
                      }
                    >
                      ${investor.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setBuyStep("details")}
                    className="flex-1 py-3 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    Back
                  </button>
                  <GradientButton
                    onClick={() => setBuyStep("confirm")}
                    className="flex-1"
                    disabled={investor.balance < totalCost}
                  >
                    Continue
                  </GradientButton>
                </div>
              </div>
            )}

            {/* Step: Confirmation */}
            {buyStep === "confirm" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Confirm Purchase
                </h2>
                <p className="text-muted-foreground mb-6">
                  Review your investment details
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">Bond Name</span>
                    <span className="text-foreground font-medium">
                      {selectedBond.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">Yield</span>
                    <span className="text-primary font-medium">
                      {selectedBond.yield}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">Maturity</span>
                    <span className="text-foreground font-medium">
                      {selectedBond.tenure} months
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground font-medium">
                      {quantity} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-foreground font-medium">
                      Total Cost
                    </span>
                    <span className="text-primary font-bold text-lg">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-success/10 border border-success/20">
                    <span className="text-foreground font-medium">
                      Expected Returns
                    </span>
                    <span className="text-success font-bold">
                      +${expectedReturn.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Oracle Verified Badge - Simple display only, NO API calls */}
                {selectedBond.approvalStatus === "approved" && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 mb-4">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <span className="text-success font-medium">
                      Oracle Verified ✓
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setBuyStep("quantity")}
                    className="flex-1 py-3 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    Back
                  </button>
                  <GradientButton
                    onClick={handleConfirmPurchase}
                    className="flex-1"
                  >
                    Confirm Purchase
                  </GradientButton>
                </div>
              </div>
            )}

            {/* Step: Processing */}
            {buyStep === "processing" && (
              <div className="animate-fade-in text-center py-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Processing Investment
                </h3>
                <p className="text-muted-foreground">
                  Allocating bond units to your portfolio...
                </p>
              </div>
            )}

            {/* Step: Success */}
            {buyStep === "success" && (
              <div className="animate-scale-in text-center py-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-success/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center border border-success/30">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Investment Successful!
                </h3>
                <p className="text-muted-foreground mb-4">
                  {quantity} units of {selectedBond.name} added to your
                  portfolio
                </p>
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground">
                    Amount Invested
                  </p>
                  <p className="text-2xl font-bold text-success">
                    ${totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
