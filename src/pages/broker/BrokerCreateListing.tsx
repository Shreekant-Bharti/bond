import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBondContext } from "@/context/BondContext";
import { ListerSubType } from "@/types/bond";
import {
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Building,
  Globe,
  Wallet,
  Calendar,
  Percent,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OracleVerificationBadge } from "@/components/ui/oracle-verification-badge";

type CreateStep =
  | "basic"
  | "financial"
  | "investment"
  | "risk"
  | "review"
  | "processing"
  | "created";
type ListStep = "select" | "configure" | "validate" | "processing" | "success";

interface NewBondForm {
  // Basic Details
  name: string;
  issuer: string;
  issuerType: "Government" | "Sovereign" | "PSU" | "";
  listerSubType: ListerSubType | "";
  country: string;
  description: string;
  // Financial Details
  value: number;
  totalSupply: number;
  yield: number;
  couponFrequency: "Annual" | "Semi-Annual" | "";
  tenure: number;
  maturityDate: string;
  // Investment Rules
  minInvestment: number;
  maxUnitsPerInvestor: number;
  issueDate: string;
  listingStartDate: string;
  listingEndDate: string;
  // Risk & Category
  riskLevel: "Low" | "Moderate" | "";
  bondCategory: "Short Term" | "Medium Term" | "Long Term" | "";
}

const initialBondForm: NewBondForm = {
  name: "",
  issuer: "",
  issuerType: "",
  listerSubType: "",
  country: "",
  description: "",
  value: 0,
  totalSupply: 0,
  yield: 0,
  couponFrequency: "",
  tenure: 0,
  maturityDate: "",
  minInvestment: 1, // Minimum ₹1 investment
  maxUnitsPerInvestor: 0,
  issueDate: "",
  listingStartDate: "",
  listingEndDate: "",
  riskLevel: "",
  bondCategory: "",
};

export default function BrokerCreateListing() {
  const {
    bonds,
    listings,
    listBond,
    createBond,
    hasOverlappingListing,
    autoVerifyAndApproveBond,
  } = useBondContext();

  // Tab state
  const [activeTab, setActiveTab] = useState<"create" | "list">("create");

  // Create bond state
  const [createStep, setCreateStep] = useState<CreateStep>("basic");
  const [bondForm, setBondForm] = useState<NewBondForm>(initialBondForm);
  const [createErrors, setCreateErrors] = useState<string[]>([]);
  const [createdBondId, setCreatedBondId] = useState<string | null>(null);

  // List bond state
  const availableBonds = bonds.filter((b) => b.status === "available");
  const [listStep, setListStep] = useState<ListStep>("select");
  const [selectedBondId, setSelectedBondId] = useState("");
  const [listingConfig, setListingConfig] = useState({
    minInvestmentUnit: 1, // Minimum ₹1
    availableQuantity: 0,
    listingStartDate: "",
    listingEndDate: "",
  });
  const [listErrors, setListErrors] = useState<string[]>([]);

  const selectedBond = bonds.find((b) => b.id === selectedBondId);

  // Create Bond Functions
  const updateBondForm = (updates: Partial<NewBondForm>) => {
    setBondForm((prev) => ({ ...prev, ...updates }));
    setCreateErrors([]);
  };

  const validateBasicDetails = (): boolean => {
    const errors: string[] = [];
    if (!bondForm.name.trim()) errors.push("Bond name is required");
    if (!bondForm.issuer.trim()) errors.push("Issuer name is required");
    if (!bondForm.issuerType) errors.push("Issuer type is required");
    if (!bondForm.listerSubType) errors.push("Lister sub-type is required");
    if (!bondForm.country.trim()) errors.push("Country/Region is required");
    setCreateErrors(errors);
    return errors.length === 0;
  };

  const validateFinancialDetails = (): boolean => {
    const errors: string[] = [];
    if (bondForm.value <= 0) errors.push("Face value must be greater than 0");
    if (bondForm.totalSupply <= 0)
      errors.push("Total issue size must be greater than 0");
    if (bondForm.yield <= 0) errors.push("Annual yield must be greater than 0");
    if (!bondForm.couponFrequency) errors.push("Coupon frequency is required");
    if (bondForm.tenure <= 0) errors.push("Tenure must be greater than 0");
    if (!bondForm.maturityDate) errors.push("Maturity date is required");
    setCreateErrors(errors);
    return errors.length === 0;
  };

  const validateInvestmentRules = (): boolean => {
    const errors: string[] = [];
    // Enforce minimum ₹1 investment
    if (bondForm.minInvestment < 1)
      errors.push("Minimum investment must be at least ₹1");
    if (bondForm.maxUnitsPerInvestor <= 0)
      errors.push("Maximum units per investor must be greater than 0");
    if (!bondForm.issueDate) errors.push("Issue date is required");
    if (!bondForm.listingStartDate)
      errors.push("Listing start date is required");
    if (!bondForm.listingEndDate) errors.push("Listing end date is required");
    if (bondForm.listingStartDate && bondForm.listingEndDate) {
      if (
        new Date(bondForm.listingEndDate) <= new Date(bondForm.listingStartDate)
      ) {
        errors.push("Listing end date must be after start date");
      }
    }
    setCreateErrors(errors);
    return errors.length === 0;
  };

  const validateRiskCategory = (): boolean => {
    const errors: string[] = [];
    if (!bondForm.riskLevel) errors.push("Risk level is required");
    if (!bondForm.bondCategory) errors.push("Bond category is required");
    setCreateErrors(errors);
    return errors.length === 0;
  };

  const handleCreateNextStep = () => {
    if (createStep === "basic" && validateBasicDetails())
      setCreateStep("financial");
    else if (createStep === "financial" && validateFinancialDetails())
      setCreateStep("investment");
    else if (createStep === "investment" && validateInvestmentRules())
      setCreateStep("risk");
    else if (createStep === "risk" && validateRiskCategory())
      setCreateStep("review");
  };

  const handleCreateBond = () => {
    setCreateStep("processing");

    setTimeout(() => {
      // Enforce minimum ₹1 investment
      const minInvestment = Math.max(1, bondForm.minInvestment);

      const newBondId = createBond({
        name: bondForm.name,
        issuer: bondForm.issuer,
        yield: bondForm.yield,
        tenure: bondForm.tenure,
        value: bondForm.value,
        minInvestment: minInvestment,
        totalSupply: bondForm.totalSupply,
        availableSupply: bondForm.totalSupply,
        maturityDate: bondForm.maturityDate,
        custodianId: "custodian-001",
        description:
          bondForm.description ||
          `${bondForm.issuerType} bond issued by ${bondForm.issuer}`,
        listerSubType: bondForm.listerSubType as ListerSubType,
      });

      setCreatedBondId(newBondId);
      setCreateStep("created");

      // Bond is now pending admin approval - DO NOT auto-approve
      // Admin will manually approve via /admin/pending-bonds

      toast({
        title: "Bond Submitted for Admin Approval",
        description:
          "Your bond listing is pending admin verification. You'll be notified once approved.",
      });
    }, 2000);
  };

  const resetCreateForm = () => {
    setCreateStep("basic");
    setBondForm(initialBondForm);
    setCreateErrors([]);
    setCreatedBondId(null);
  };

  const proceedToListing = () => {
    // Find the most recently created bond
    const latestBond = bonds.find((b) => b.status === "available");
    if (latestBond) {
      setSelectedBondId(latestBond.id);
      setListingConfig({
        minInvestmentUnit: latestBond.minInvestment,
        availableQuantity: latestBond.availableSupply,
        listingStartDate: bondForm.listingStartDate,
        listingEndDate: bondForm.listingEndDate,
      });
    }
    setActiveTab("list");
    setListStep("configure");
  };

  // List Bond Functions
  const handleSelectBond = (bondId: string) => {
    const bond = bonds.find((b) => b.id === bondId);
    if (bond) {
      setSelectedBondId(bondId);
      setListingConfig((prev) => ({
        ...prev,
        availableQuantity: bond.availableSupply,
        minInvestmentUnit: bond.minInvestment,
      }));
    }
  };

  const handleValidateListing = () => {
    const errors: string[] = [];

    if (!selectedBondId) errors.push("Please select a bond to list");
    if (listingConfig.availableQuantity <= 0)
      errors.push("Available quantity must be greater than 0");
    if (
      selectedBond &&
      listingConfig.availableQuantity > selectedBond.availableSupply
    ) {
      errors.push("Quantity exceeds available supply");
    }
    if (listingConfig.minInvestmentUnit <= 0)
      errors.push("Minimum investment unit must be greater than 0");
    if (!listingConfig.listingStartDate)
      errors.push("Please set a listing start date");
    if (!listingConfig.listingEndDate)
      errors.push("Please set a listing end date");
    if (listingConfig.listingStartDate && listingConfig.listingEndDate) {
      if (
        new Date(listingConfig.listingEndDate) <=
        new Date(listingConfig.listingStartDate)
      ) {
        errors.push("End date must be after start date");
      }
    }

    if (
      selectedBondId &&
      listingConfig.listingStartDate &&
      listingConfig.listingEndDate
    ) {
      if (
        hasOverlappingListing(
          selectedBondId,
          listingConfig.listingStartDate,
          listingConfig.listingEndDate
        )
      ) {
        errors.push(
          "This bond already has an active listing with overlapping dates"
        );
      }
    }

    setListErrors(errors);

    if (errors.length === 0) {
      setListStep("validate");
    }
  };

  const handlePublish = () => {
    setListStep("processing");

    setTimeout(() => {
      const result = listBond(selectedBondId, {
        minInvestmentUnit: listingConfig.minInvestmentUnit,
        availableQuantity: listingConfig.availableQuantity,
        listingStartDate: listingConfig.listingStartDate,
        listingEndDate: listingConfig.listingEndDate,
      });

      if (result.success) {
        setListStep("success");
        toast({
          title: "Listing Published Successfully",
          description:
            "The bond is now visible to investors in the Available Bonds section.",
        });
      } else {
        setListStep("validate");
        toast({
          title: "Publish Failed",
          description:
            result.error || "Unable to publish listing. Please try again.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const resetListForm = () => {
    setListStep("select");
    setSelectedBondId("");
    setListingConfig({
      minInvestmentUnit: 1,
      availableQuantity: 0,
      listingStartDate: "",
      listingEndDate: "",
    });
    setListErrors([]);
  };

  const isListValidForPublish =
    selectedBondId &&
    listingConfig.availableQuantity > 0 &&
    listingConfig.minInvestmentUnit > 0 &&
    listingConfig.listingStartDate &&
    listingConfig.listingEndDate &&
    new Date(listingConfig.listingEndDate) >
      new Date(listingConfig.listingStartDate);

  const createStepIndex = [
    "basic",
    "financial",
    "investment",
    "risk",
    "review",
    "created",
  ].indexOf(createStep);

  return (
    <DashboardLayout
      title="Create & Publish Listing"
      subtitle="Create bonds and list them for investors"
    >
      <div className="max-w-4xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "create" | "list")}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Bond
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              List Bond
            </TabsTrigger>
          </TabsList>

          {/* CREATE BOND TAB */}
          <TabsContent value="create" className="mt-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 px-4 overflow-x-auto">
              {[
                "Basic",
                "Financial",
                "Investment",
                "Risk",
                "Review",
                "Done",
              ].map((label, idx) => {
                const isActive =
                  idx <= createStepIndex || createStep === "processing";
                const isCurrent =
                  idx === createStepIndex ||
                  (createStep === "processing" && idx === 5);

                return (
                  <div key={label} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all flex-shrink-0",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/30 text-muted-foreground",
                        isCurrent &&
                          "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={cn(
                        "ml-2 text-xs hidden sm:block whitespace-nowrap",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                    {idx < 5 && (
                      <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Basic Details */}
            {createStep === "basic" && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Basic Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Enter bond and issuer information
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bondName">Bond Name *</Label>
                      <Input
                        id="bondName"
                        placeholder="e.g., Government Savings Bond 2025"
                        value={bondForm.name}
                        onChange={(e) =>
                          updateBondForm({ name: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issuer">Issuer Name *</Label>
                      <Input
                        id="issuer"
                        placeholder="e.g., Reserve Bank of India"
                        value={bondForm.issuer}
                        onChange={(e) =>
                          updateBondForm({ issuer: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer Type *</Label>
                      <Select
                        value={bondForm.issuerType}
                        onValueChange={(v) =>
                          updateBondForm({
                            issuerType: v as NewBondForm["issuerType"],
                          })
                        }
                      >
                        <SelectTrigger className="bg-muted/20 border-border/50">
                          <SelectValue placeholder="Select issuer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Government">Government</SelectItem>
                          <SelectItem value="Sovereign">Sovereign</SelectItem>
                          <SelectItem value="PSU">
                            PSU (Public Sector)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lister Sub-Type *</Label>
                      <Select
                        value={bondForm.listerSubType}
                        onValueChange={(v) =>
                          updateBondForm({ listerSubType: v as ListerSubType })
                        }
                      >
                        <SelectTrigger className="bg-muted/20 border-border/50">
                          <SelectValue placeholder="Select lister type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Broker">Broker</SelectItem>
                          <SelectItem value="Custodian">Custodian</SelectItem>
                          <SelectItem value="Financial Institution">
                            Financial Institution
                          </SelectItem>
                          <SelectItem value="Government Partner">
                            Government Partner
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country / Region *</Label>
                      <Input
                        id="country"
                        placeholder="e.g., India"
                        value={bondForm.country}
                        onChange={(e) =>
                          updateBondForm({ country: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of the bond"
                      value={bondForm.description}
                      onChange={(e) =>
                        updateBondForm({ description: e.target.value })
                      }
                      className="bg-muted/20 border-border/50"
                    />
                  </div>

                  {createErrors.length > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                      {createErrors.map((error, i) => (
                        <p
                          key={i}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleCreateNextStep} className="gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Financial Details */}
            {createStep === "financial" && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Financial Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Set bond value and yield parameters
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalBondValue">
                        Total Bond Value (₹ INR) *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="totalBondValue"
                          type="number"
                          min={1}
                          placeholder="e.g., 10,00,000"
                          value={bondForm.value || ""}
                          onChange={(e) =>
                            updateBondForm({
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="bg-muted/20 border-border/50 pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalSupply">
                        Number of Tokens (units) *
                      </Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        min={1}
                        placeholder="e.g., 10000"
                        value={bondForm.totalSupply || ""}
                        onChange={(e) =>
                          updateBondForm({
                            totalSupply: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>

                    {/* Auto-calculated Token Price in INR */}
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Label>Token Price (₹ INR - Auto-calculated)</Label>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                          Auto
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-medium ml-auto">
                          🇮🇳 INR
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          readOnly
                          value={
                            bondForm.value > 0 && bondForm.totalSupply > 0
                              ? `₹${(
                                  bondForm.value / bondForm.totalSupply
                                ).toFixed(2)} per token`
                              : "Enter Total Bond Value and Number of Tokens"
                          }
                          className="bg-primary/5 border-primary/30 text-foreground font-medium cursor-not-allowed"
                        />
                        {bondForm.value > 0 && bondForm.totalSupply > 0 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="text-xs text-muted-foreground">
                              = ₹{bondForm.value.toLocaleString("en-IN")} ÷{" "}
                              {bondForm.totalSupply.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Token Price = Total Bond Value ÷ Number of Tokens (All
                        values in INR ₹)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yield">Annual Yield (%) *</Label>
                      <Input
                        id="yield"
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="e.g., 7.5"
                        value={bondForm.yield || ""}
                        onChange={(e) =>
                          updateBondForm({
                            yield: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Coupon Frequency *</Label>
                      <Select
                        value={bondForm.couponFrequency}
                        onValueChange={(v) =>
                          updateBondForm({
                            couponFrequency:
                              v as NewBondForm["couponFrequency"],
                          })
                        }
                      >
                        <SelectTrigger className="bg-muted/20 border-border/50">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Annual">Annual</SelectItem>
                          <SelectItem value="Semi-Annual">
                            Semi-Annual
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenure">Tenure (years) *</Label>
                      <Input
                        id="tenure"
                        type="number"
                        min={1}
                        placeholder="e.g., 5"
                        value={bondForm.tenure || ""}
                        onChange={(e) =>
                          updateBondForm({
                            tenure: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maturityDate">Maturity Date *</Label>
                      <Input
                        id="maturityDate"
                        type="date"
                        value={bondForm.maturityDate}
                        onChange={(e) =>
                          updateBondForm({ maturityDate: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                  </div>

                  {createErrors.length > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                      {createErrors.map((error, i) => (
                        <p
                          key={i}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCreateStep("basic")}
                  >
                    Back
                  </Button>
                  <Button onClick={handleCreateNextStep} className="gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Investment Rules */}
            {createStep === "investment" && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Investment Rules
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Define investment parameters and listing window
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minInvestment">
                        Minimum Investment Units *
                      </Label>
                      <Input
                        id="minInvestment"
                        type="number"
                        min={1}
                        placeholder="e.g., 100"
                        value={bondForm.minInvestment || ""}
                        onChange={(e) =>
                          updateBondForm({
                            minInvestment: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxUnits">
                        Maximum Units per Investor *
                      </Label>
                      <Input
                        id="maxUnits"
                        type="number"
                        min={1}
                        placeholder="e.g., 10000"
                        value={bondForm.maxUnitsPerInvestor || ""}
                        onChange={(e) =>
                          updateBondForm({
                            maxUnitsPerInvestor: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date *</Label>
                      <Input
                        id="issueDate"
                        type="date"
                        value={bondForm.issueDate}
                        onChange={(e) =>
                          updateBondForm({ issueDate: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="listingStartDate">
                        Listing Start Date *
                      </Label>
                      <Input
                        id="listingStartDate"
                        type="date"
                        value={bondForm.listingStartDate}
                        onChange={(e) =>
                          updateBondForm({ listingStartDate: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="listingEndDate">Listing End Date *</Label>
                      <Input
                        id="listingEndDate"
                        type="date"
                        value={bondForm.listingEndDate}
                        onChange={(e) =>
                          updateBondForm({ listingEndDate: e.target.value })
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                  </div>

                  {createErrors.length > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                      {createErrors.map((error, i) => (
                        <p
                          key={i}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCreateStep("financial")}
                  >
                    Back
                  </Button>
                  <Button onClick={handleCreateNextStep} className="gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Risk & Category */}
            {createStep === "risk" && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Risk & Category
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Define risk level and bond classification
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Risk Level *</Label>
                      <Select
                        value={bondForm.riskLevel}
                        onValueChange={(v) =>
                          updateBondForm({
                            riskLevel: v as NewBondForm["riskLevel"],
                          })
                        }
                      >
                        <SelectTrigger className="bg-muted/20 border-border/50">
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low Risk</SelectItem>
                          <SelectItem value="Moderate">
                            Moderate Risk
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bond Category *</Label>
                      <Select
                        value={bondForm.bondCategory}
                        onValueChange={(v) =>
                          updateBondForm({
                            bondCategory: v as NewBondForm["bondCategory"],
                          })
                        }
                      >
                        <SelectTrigger className="bg-muted/20 border-border/50">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Short Term">
                            Short Term (&lt; 3 years)
                          </SelectItem>
                          <SelectItem value="Medium Term">
                            Medium Term (3-7 years)
                          </SelectItem>
                          <SelectItem value="Long Term">
                            Long Term (&gt; 7 years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {createErrors.length > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                      {createErrors.map((error, i) => (
                        <p
                          key={i}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCreateStep("investment")}
                  >
                    Back
                  </Button>
                  <Button onClick={handleCreateNextStep} className="gap-2">
                    Review Bond
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 5: Review */}
            {createStep === "review" && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Review Bond Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Confirm all details before creating
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Basic Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Issuer:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.issuer}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.issuerType}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Country:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Financial Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Face Value:
                        </span>{" "}
                        <span className="text-foreground ml-2">
                          ₹{bondForm.value.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total Supply:
                        </span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.totalSupply.toLocaleString()} units
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Yield:</span>{" "}
                        <span className="text-success ml-2 font-semibold">
                          {bondForm.yield}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tenure:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.tenure} years ({bondForm.tenure * 12}{" "}
                          months)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coupon:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.couponFrequency}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Maturity:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.maturityDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Investment & Risk
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Min Investment:
                        </span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.minInvestment} units
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Max/Investor:
                        </span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.maxUnitsPerInvestor} units
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Risk Level:
                        </span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.riskLevel}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.bondCategory}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">
                          Listing Window:
                        </span>{" "}
                        <span className="text-foreground ml-2">
                          {bondForm.listingStartDate} to{" "}
                          {bondForm.listingEndDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">
                        Total Issue Value
                      </span>
                      <span className="text-primary font-bold text-lg">
                        ₹
                        {(bondForm.value * bondForm.totalSupply).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Oracle Rate Verification Preview */}
                  {bondForm.yield > 0 && (
                    <OracleVerificationBadge
                      listingYield={bondForm.yield}
                      showRefresh={false}
                    />
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCreateStep("risk")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateBond}
                    className="gap-2 bg-success hover:bg-success/90"
                  >
                    <Plus className="w-4 h-4" />
                    Create Bond
                  </Button>
                </div>
              </Card>
            )}

            {/* Processing */}
            {createStep === "processing" && (
              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 text-center animate-fade-in">
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Creating Bond...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we process your bond creation
                </p>
              </Card>
            )}

            {/* Created */}
            {createStep === "created" && (
              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-warning" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Bond Submitted for Approval
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your bond "{bondForm.name}" has been submitted and is pending
                  admin verification. You'll be notified once it's approved.
                </p>

                {/* Oracle Verification Result - Lister can see this */}
                {bondForm.yield > 0 && (
                  <div className="mb-6 max-w-md mx-auto">
                    <OracleVerificationBadge listingYield={bondForm.yield} />
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetCreateForm}>
                    Create Another Bond
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* LIST BOND TAB */}
          <TabsContent value="list" className="mt-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 px-4">
              {["Select Bond", "Configure", "Validate", "Publish"].map(
                (label, idx) => {
                  const stepIndex = [
                    "select",
                    "configure",
                    "validate",
                    "success",
                  ].indexOf(listStep);
                  const isActive =
                    idx <= stepIndex || listStep === "processing";
                  const isCurrent =
                    (listStep === "select" && idx === 0) ||
                    (listStep === "configure" && idx === 1) ||
                    (listStep === "validate" && idx === 2) ||
                    ((listStep === "processing" || listStep === "success") &&
                      idx === 3);

                  return (
                    <div key={label} className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/30 text-muted-foreground",
                          isCurrent &&
                            "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={cn(
                          "ml-2 text-sm hidden sm:block",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {label}
                      </span>
                      {idx < 3 && (
                        <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {/* Step 1: Select Bond */}
            {listStep === "select" && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Select Bond to List
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Choose from your created bonds
                    </p>
                  </div>
                </div>

                {availableBonds.length > 0 ? (
                  <div className="space-y-3">
                    {availableBonds.map((bond, index) => (
                      <div
                        key={bond.id}
                        onClick={() => handleSelectBond(bond.id)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all duration-200 animate-fade-in",
                          selectedBondId === bond.id
                            ? "border-primary bg-primary/5"
                            : "border-border/30 bg-muted/10 hover:border-primary/50"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              {bond.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {bond.issuer}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-success font-semibold">
                              {bond.yield}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bond.tenure} months
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Available: {bond.availableSupply.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            Value: ₹{bond.value.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">
                      No bonds available for listing
                    </p>
                    <p className="text-sm mt-1">
                      Create a bond first using the "Create Bond" tab
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab("create")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Bond
                    </Button>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setListStep("configure")}
                    disabled={!selectedBondId}
                    className="gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Configure */}
            {listStep === "configure" && selectedBond && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Configure Listing
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Set listing parameters for {selectedBond.name}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/30 mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Selected Bond Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bond Name:</span>
                      <span className="ml-2 text-foreground font-medium">
                        {selectedBond.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="ml-2 text-foreground">
                        {selectedBond.issuer}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Yield:</span>
                      <span className="ml-2 text-success font-semibold">
                        {selectedBond.yield}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tenure:</span>
                      <span className="ml-2 text-foreground">
                        {selectedBond.tenure} months
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minUnit">Minimum Investment Unit</Label>
                      <Input
                        id="minUnit"
                        type="number"
                        min={1}
                        value={listingConfig.minInvestmentUnit}
                        onChange={(e) =>
                          setListingConfig((prev) => ({
                            ...prev,
                            minInvestmentUnit: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Available Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        max={selectedBond.availableSupply}
                        value={listingConfig.availableQuantity}
                        onChange={(e) =>
                          setListingConfig((prev) => ({
                            ...prev,
                            availableQuantity: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="bg-muted/20 border-border/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Max: {selectedBond.availableSupply.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Listing Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={listingConfig.listingStartDate}
                        onChange={(e) =>
                          setListingConfig((prev) => ({
                            ...prev,
                            listingStartDate: e.target.value,
                          }))
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Listing End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={listingConfig.listingEndDate}
                        onChange={(e) =>
                          setListingConfig((prev) => ({
                            ...prev,
                            listingEndDate: e.target.value,
                          }))
                        }
                        className="bg-muted/20 border-border/50"
                      />
                    </div>
                  </div>

                  {listErrors.length > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                      {listErrors.map((error, i) => (
                        <p
                          key={i}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setListStep("select")}
                  >
                    Back
                  </Button>
                  <Button onClick={handleValidateListing} className="gap-2">
                    Validate & Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Validate */}
            {listStep === "validate" && selectedBond && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Validation Passed
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Review and confirm listing details
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-muted/10 border border-border/30">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Bond Name</span>
                    <span className="text-foreground font-medium">
                      {selectedBond.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Issuer</span>
                    <span className="text-foreground">
                      {selectedBond.issuer}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Yield</span>
                    <span className="text-success font-semibold">
                      {selectedBond.yield}%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">
                      Min Investment
                    </span>
                    <span className="text-foreground">
                      {listingConfig.minInvestmentUnit} units
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">
                      Available Quantity
                    </span>
                    <span className="text-foreground">
                      {listingConfig.availableQuantity.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">
                      Listing Window
                    </span>
                    <span className="text-foreground">
                      {listingConfig.listingStartDate} to{" "}
                      {listingConfig.listingEndDate}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setListStep("configure")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePublish}
                    className="gap-2 bg-success hover:bg-success/90"
                    disabled={!isListValidForPublish}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Publish Listing
                  </Button>
                </div>
              </Card>
            )}

            {/* Processing */}
            {listStep === "processing" && (
              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 text-center animate-fade-in">
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Publishing Listing...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we process your listing
                </p>
              </Card>
            )}

            {/* Success */}
            {listStep === "success" && (
              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Listing Published Successfully!
                </h2>
                <p className="text-muted-foreground mb-4">
                  The bond is now visible to investors and available for
                  purchase.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Investors can view and buy this bond from their Available
                  Bonds section.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetListForm}>
                    List Another Bond
                  </Button>
                  <Button
                    onClick={() => {
                      resetListForm();
                      setActiveTab("create");
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Bond
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
