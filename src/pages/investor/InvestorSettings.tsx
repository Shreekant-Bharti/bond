import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { User, Mail, Globe, Wallet, Save, CheckCircle2 } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "@/hooks/use-toast";

export default function InvestorSettings() {
  const { investor, updateInvestorProfile } = useBondContext();
  
  const [fullName, setFullName] = useState(investor.name);
  const [country, setCountry] = useState(investor.country || '');
  const [preferredCurrency, setPreferredCurrency] = useState<'INR' | 'USDT'>(investor.preferredCurrency || 'USDT');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFullName(investor.name);
    setCountry(investor.country || '');
    setPreferredCurrency(investor.preferredCurrency || 'USDT');
  }, [investor]);

  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      updateInvestorProfile({
        name: fullName,
        country,
        preferredCurrency,
      });
      
      setIsSaving(false);
      setShowSuccess(true);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300";

  return (
    <DashboardLayout title="Settings" subtitle="Manage your profile and preferences">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={investor.email}
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Country */}
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" /> Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
                placeholder="Enter your country"
              />
            </div>

            {/* Preferred Currency */}
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4" /> Preferred Currency
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredCurrency('INR')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    preferredCurrency === 'INR' 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredCurrency('USDT')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    preferredCurrency === 'USDT' 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
                  }`}
                >
                  $ USDT
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center gap-4">
            <GradientButton 
              className="hover:scale-[1.02] transition-transform duration-300"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Saving...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </GradientButton>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Account Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account ID</p>
              <p className="text-foreground font-mono">{investor.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member Since</p>
              <p className="text-foreground">{investor.createdAt}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="text-foreground capitalize">Investor</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
