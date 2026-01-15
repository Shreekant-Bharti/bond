import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import {
  Store,
  TrendingUp,
  DollarSign,
  Calendar,
  ShoppingCart,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { OracleVerificationBadge } from "@/components/ui/oracle-verification-badge";

type BuyStep = "browse" | "confirm" | "processing" | "success";

export default function InvestorSecondaryMarket() {
  const {
    getSecondaryMarketListingsForInvestors,
    buyFromSecondaryMarket,
    getBondById,
    investor,
  } = useBondContext();
  const { toast } = useToast();
  const [step, setStep] = useState<BuyStep>("browse");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );

  // Use the filtered function to get only valid listings
  const availableListings = getSecondaryMarketListingsForInvestors();

  // Use the context's secondaryMarketListings for finding the selected listing
  const { secondaryMarketListings } = useBondContext();

  const selectedListing = selectedListingId
    ? secondaryMarketListings.find((l) => l.id === selectedListingId)
    : null;

  const selectedBond = selectedListing
    ? getBondById(selectedListing.bondId)
    : null;

  const handleBuyClick = (listingId: string) => {
    setSelectedListingId(listingId);
    setStep("confirm");
  };

  const handleConfirmPurchase = async () => {
    if (!selectedListingId) return;

    setStep("processing");

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = buyFromSecondaryMarket(selectedListingId);

    if (result.success) {
      setStep("success");
    } else {
      toast({
        title: "Purchase Failed",
        description: result.error,
        variant: "destructive",
      });
      setStep("browse");
    }
  };

  const handleReset = () => {
    setStep("browse");
    setSelectedListingId(null);
  };

  return (
    <DashboardLayout
      title="Secondary Market"
      subtitle="Buy bonds from other investors"
    >
      {/* Browse Listings */}
      {step === "browse" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Available Bonds
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse bonds listed by other investors
              </p>
            </div>
          </div>

          {availableListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableListings.map((listing, index) => {
                const bond = getBondById(listing.bondId);
                if (!bond) return null;

                // Check if this is the current investor's own listing
                const isOwnListing = listing.sellerId === investor.id;

                return (
                  <Card
                    key={listing.id}
                    className={`p-5 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300 animate-fade-in ${
                      isOwnListing ? "ring-1 ring-primary/40" : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      {isOwnListing && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          Your Listing
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                        {listing.yield}% Yield
                      </span>
                    </div>

                    <h4 className="font-semibold text-foreground mb-2">
                      {bond.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {bond.issuer}
                    </p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="text-foreground font-medium">
                          {listing.quantity} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Selling Price
                        </span>
                        <span className="text-foreground font-bold">
                          ${listing.sellingPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity</span>
                        <span className="text-foreground">
                          {bond.maturityDate}
                        </span>
                      </div>
                    </div>

                    {isOwnListing ? (
                      <div className="w-full px-4 py-3 rounded-xl bg-muted/30 text-center text-sm text-muted-foreground">
                        Listed for Sale
                      </div>
                    ) : (
                      <GradientButton
                        className="w-full"
                        onClick={() => handleBuyClick(listing.id)}
                        disabled={investor.balance < listing.sellingPrice}
                      >
                        {investor.balance < listing.sellingPrice
                          ? "Insufficient Balance"
                          : "Buy Now"}
                      </GradientButton>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-card/40 border-border/50">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h4 className="text-lg font-semibold text-foreground mb-2">
                No Bonds Available
              </h4>
              <p className="text-muted-foreground">
                There are currently no bonds listed for sale in the secondary
                market.
              </p>
            </Card>
          )}

          {/* Wallet Balance Info */}
          <Card className="p-4 bg-muted/10 border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Your Wallet Balance:
              </span>
              <span className="text-foreground font-bold">
                ${investor.balance.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Purchase */}
      {step === "confirm" && selectedListing && selectedBond && (
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Market
          </button>

          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Confirm Purchase
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Review the details before completing your purchase
            </p>

            <div className="p-5 rounded-xl bg-muted/20 border border-border/30 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bond Name</span>
                <span className="text-foreground font-medium">
                  {selectedBond.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issuer</span>
                <span className="text-foreground">{selectedBond.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="text-foreground font-medium">
                  {selectedListing.quantity} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yield</span>
                <span className="text-success font-medium">
                  {selectedListing.yield}%
                </span>
              </div>
              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Price</span>
                <span className="text-foreground font-bold text-lg">
                  ${selectedListing.sellingPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Oracle Verification */}
            <OracleVerificationBadge
              listingYield={selectedListing.yield}
              className="mb-6"
            />

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Your Balance After Purchase
                </span>
                <span className="text-foreground font-medium">
                  $
                  {(
                    investor.balance - selectedListing.sellingPrice
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted transition-all duration-300"
              >
                Cancel
              </button>
              <GradientButton
                className="flex-1"
                onClick={handleConfirmPurchase}
              >
                Confirm Purchase
              </GradientButton>
            </div>
          </Card>
        </div>
      )}

      {/* Processing */}
      {step === "processing" && (
        <div className="max-w-md mx-auto">
          <Card className="p-10 text-center bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Processing Purchase
            </h3>
            <p className="text-muted-foreground">
              Please wait while we complete your transaction...
            </p>
          </Card>
        </div>
      )}

      {/* Success */}
      {step === "success" && selectedBond && (
        <div className="max-w-md mx-auto">
          <Card className="p-10 text-center bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm animate-scale-in">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Purchase Successful!
            </h3>
            <p className="text-muted-foreground mb-4">
              You have successfully purchased {selectedBond.name}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The bond has been added to your portfolio.
            </p>

            <GradientButton
              className="w-full hover:scale-[1.02] transition-transform duration-300"
              onClick={handleReset}
            >
              Back to Secondary Market
            </GradientButton>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
