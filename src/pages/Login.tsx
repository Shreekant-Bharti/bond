import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GridBackground } from "@/components/ui/grid-background";
import { GlowCard } from "@/components/ui/glow-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { useBondContext } from "@/context/BondContext";
import { UserRole, DEMO_CREDENTIALS } from "@/types/bond";
import { useToast } from "@/hooks/use-toast";
import { generateInvestorTermsPDF } from "@/lib/termsAndConditions";
import { findUserByEmail } from "@/lib/userStorage";
import {
  User,
  Building2,
  Shield,
  Landmark,
  Briefcase,
  ArrowLeft,
  Mail,
  Lock,
  Globe,
  Wallet,
  FileText,
  Eye,
  Hash,
  MapPin,
  CheckCircle2,
  Loader2,
  Download,
  Clock,
} from "lucide-react";

type Step = "role" | "auth" | "authenticating" | "approved" | "pending";

const roleLabels: Record<UserRole, string> = {
  investor: "Investor",
  broker: "Lister",
  custodian: "Custodian",
  financial_institution: "Financial Institution",
  government_partner: "Government Partner",
};

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithCredentials, registerNewUser } = useBondContext();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("role");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state - Common
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Investor fields
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<"INR" | "USDT">(
    "USDT"
  );
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Common Lister fields
  const [orgName, setOrgName] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  // Broker specific
  const [licenseNumber, setLicenseNumber] = useState("");
  const [operatingRegion, setOperatingRegion] = useState("");

  // Custodian specific
  const [custodyType, setCustodyType] = useState("");
  const [assetClassSupported, setAssetClassSupported] = useState("");

  // FI specific
  const [issuerCategory, setIssuerCategory] = useState("");
  const [yearsOfOperation, setYearsOfOperation] = useState("");

  // Gov fields
  const [departmentName, setDepartmentName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  // Authentication timer effect
  useEffect(() => {
    if (step === "authenticating") {
      const duration = 8000; // 8 seconds
      const interval = 50; // Update every 50ms
      const increment = (interval / duration) * 100;

      const timer = setInterval(() => {
        setAuthProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + increment;
        });
      }, interval);

      // Move to approved state after 8 seconds
      const approvedTimer = setTimeout(() => {
        setStep("approved");
      }, duration);

      return () => {
        clearInterval(timer);
        clearTimeout(approvedTimer);
      };
    }
  }, [step]);

  // Redirect after approved (for registration flow)
  useEffect(() => {
    if (step === "approved" && selectedRole) {
      const redirectTimer = setTimeout(() => {
        // User is already logged in from registration, just navigate
        navigateToDashboard(selectedRole);
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [step, selectedRole]);

  const handleRoleSelect = (role: "investor" | "lister") => {
    if (role === "investor") {
      setSelectedRole("investor");
    } else {
      // Lister goes directly to broker dashboard (unified lister dashboard)
      setSelectedRole("broker");
    }
    setStep("auth");
    setShowRegister(false);
  };

  const handleDemoCredentials = () => {
    if (selectedRole) {
      const creds = DEMO_CREDENTIALS[selectedRole];
      setLoginEmail(creds.email);
      setLoginPassword(creds.password);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password");
      return;
    }

    if (selectedRole) {
      // Check if using demo credentials
      const demoEmail = DEMO_CREDENTIALS[selectedRole].email;
      if (loginEmail === demoEmail) {
        login(selectedRole);
        navigateToDashboard(selectedRole);
        return;
      }

      // Check user verification status before login
      const existingUser = findUserByEmail(loginEmail);
      if (existingUser) {
        if (existingUser.verificationStatus === "pending") {
          setLoginError(
            "Account pending admin verification. Please wait for approval."
          );
          navigate("/account-pending");
          return;
        }
        if (existingUser.verificationStatus === "rejected") {
          setLoginError(
            "Account verification was rejected. Please contact support."
          );
          return;
        }
      }

      // Try to authenticate with credentials
      const result = loginWithCredentials(loginEmail, loginPassword);

      if (result.success) {
        navigateToDashboard(selectedRole);
      } else {
        setLoginError(result.error || "Login failed");
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!regEmail || !regPassword) {
      setRegisterError("Please enter email and password");
      return;
    }

    if (selectedRole === "investor" && !termsAgreed) {
      setRegisterError("Please agree to the Terms & Conditions");
      return;
    }

    if (selectedRole) {
      // Register the new user
      const result = registerNewUser({
        email: regEmail,
        password: regPassword,
        role: selectedRole,
        name: selectedRole === "investor" ? fullName : orgName,
        country: country,
        preferredCurrency: preferredCurrency,
        orgName: orgName,
      });

      if (result.success && result.user) {
        toast({
          title: "Registration Successful!",
          description: "Your account awaits admin verification.",
        });

        // Show pending registration screen
        setStep("pending");
      } else {
        setRegisterError(result.error || "Registration failed");
      }
    }
  };

  const navigateToDashboard = (role: UserRole) => {
    const routes: Record<UserRole, string> = {
      investor: "/investor",
      broker: "/broker",
      custodian: "/custodian",
      financial_institution: "/fi",
      government_partner: "/gov",
    };
    navigate(routes[role]);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300";

  return (
    <GridBackground className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <Link
          to="/landing"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="text-2xl font-bold text-foreground">BondFi</span>
        </Link>

        {/* Step: Role Selection */}
        {step === "role" && (
          <div className="max-w-md mx-auto space-y-4 animate-slide-up">
            <h2 className="text-2xl font-bold text-center text-foreground mb-6">
              Choose Your Role
            </h2>
            <GlowCard
              className="cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
              onClick={() => handleRoleSelect("investor")}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    Investor
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Buy fractional bonds with stablecoins
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <ArrowLeft className="w-4 h-4 text-primary rotate-180" />
                </div>
              </div>
            </GlowCard>
            <GlowCard
              className="cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_hsl(var(--secondary)/0.2)]"
              onClick={() => handleRoleSelect("lister")}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-secondary/20 transition-all duration-300">
                  <Building2 className="w-7 h-7 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    Lister
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Institution, broker, or partner access
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-all">
                  <ArrowLeft className="w-4 h-4 text-secondary rotate-180" />
                </div>
              </div>
            </GlowCard>
          </div>
        )}

        {/* Step: Auth Form */}
        {step === "auth" && selectedRole && (
          <div className="animate-slide-up max-w-xl mx-auto">
            <button
              onClick={() => setStep("role")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {roleLabels[selectedRole]} Portal
              </h2>
              <p className="text-muted-foreground mt-1">
                Sign in to your account
              </p>
            </div>

            {/* Login Card */}
            <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 shadow-xl overflow-hidden group hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)] transition-all duration-300">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Welcome Back
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Sign in to your account
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <Lock className="w-3 h-3" /> Password
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                  {loginError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                      {loginError}
                    </div>
                  )}

                  <GradientButton
                    type="submit"
                    className="w-full hover:scale-[1.02] transition-transform duration-300"
                  >
                    Login
                  </GradientButton>
                </form>

                <button
                  onClick={handleDemoCredentials}
                  className="w-full mt-4 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  Use Pre-filled Credentials
                </button>

                {/* Create Account Toggle */}
                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRegister(!showRegister)}
                      className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 hover:underline"
                    >
                      {showRegister ? "Hide Registration" : "Create Account"}
                    </button>
                  </p>
                </div>

                {/* Registration Form - Conditionally Shown */}
                {showRegister && (
                  <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      Create Account
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join BondFi as {roleLabels[selectedRole]}
                    </p>

                    <form onSubmit={handleRegister} className="space-y-3">
                      {/* Investor Registration Fields */}
                      {selectedRole === "investor" && (
                        <>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <User className="w-3 h-3" /> Full Name
                            </label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className={inputClass}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Mail className="w-3 h-3" /> Email
                            </label>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className={inputClass}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Lock className="w-3 h-3" /> Password
                            </label>
                            <input
                              type="password"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              className={inputClass}
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Globe className="w-3 h-3" /> Country
                            </label>
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className={inputClass}
                              placeholder="India"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Wallet className="w-3 h-3" /> Preferred Currency
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setPreferredCurrency("INR")}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  preferredCurrency === "INR"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                ₹ INR
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreferredCurrency("USDT")}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  preferredCurrency === "USDT"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                $ USDT
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                generateInvestorTermsPDF(
                                  fullName || "Investor",
                                  regEmail || "investor@bondfi.com"
                                )
                              }
                              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-300 hover:underline"
                            >
                              <Download className="w-4 h-4" />
                              Download Terms & Conditions (PDF)
                            </button>
                            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                              <input
                                type="checkbox"
                                checked={termsAgreed}
                                onChange={(e) =>
                                  setTermsAgreed(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-border bg-input accent-primary"
                              />
                              I have read and agree to the Terms & Conditions
                            </label>
                          </div>
                        </>
                      )}

                      {/* Lister Common Fields + Role-specific Fields */}
                      {selectedRole !== "investor" && (
                        <>
                          {/* Common Lister Fields */}
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Building2 className="w-3 h-3" /> Organization /
                              Institution Name
                            </label>
                            <input
                              type="text"
                              value={orgName}
                              onChange={(e) => setOrgName(e.target.value)}
                              className={inputClass}
                              placeholder="ABC Securities Ltd."
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Mail className="w-3 h-3" /> Official Email
                            </label>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className={inputClass}
                              placeholder="contact@company.com"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Lock className="w-3 h-3" /> Password
                            </label>
                            <input
                              type="password"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              className={inputClass}
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Globe className="w-3 h-3" /> Country
                            </label>
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className={inputClass}
                              placeholder="India"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Hash className="w-3 h-3" /> Registration /
                              Authorization ID
                            </label>
                            <input
                              type="text"
                              value={registrationId}
                              onChange={(e) =>
                                setRegistrationId(e.target.value)
                              }
                              className={inputClass}
                              placeholder="REG-2024-XXXXX"
                            />
                          </div>

                          {/* Broker Specific Fields */}
                          {selectedRole === "broker" && (
                            <>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <FileText className="w-3 h-3" /> License
                                  Number
                                </label>
                                <input
                                  type="text"
                                  value={licenseNumber}
                                  onChange={(e) =>
                                    setLicenseNumber(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="LIC-2024-XXXXX"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <MapPin className="w-3 h-3" /> Operating
                                  Region
                                </label>
                                <input
                                  type="text"
                                  value={operatingRegion}
                                  onChange={(e) =>
                                    setOperatingRegion(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="Pan-India / Mumbai"
                                />
                              </div>
                            </>
                          )}

                          {/* Custodian Specific Fields */}
                          {selectedRole === "custodian" && (
                            <>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <Shield className="w-3 h-3" /> Custody Type
                                </label>
                                <input
                                  type="text"
                                  value={custodyType}
                                  onChange={(e) =>
                                    setCustodyType(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="Securities Custodian"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <FileText className="w-3 h-3" /> Asset Class
                                  Supported
                                </label>
                                <input
                                  type="text"
                                  value={assetClassSupported}
                                  onChange={(e) =>
                                    setAssetClassSupported(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="Government Bonds, Corporate Bonds"
                                />
                              </div>
                            </>
                          )}

                          {/* Financial Institution Specific Fields */}
                          {selectedRole === "financial_institution" && (
                            <>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <FileText className="w-3 h-3" /> Issuer
                                  Category
                                </label>
                                <input
                                  type="text"
                                  value={issuerCategory}
                                  onChange={(e) =>
                                    setIssuerCategory(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="Government Securities / Corporate"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <Hash className="w-3 h-3" /> Years of
                                  Operation
                                </label>
                                <input
                                  type="text"
                                  value={yearsOfOperation}
                                  onChange={(e) =>
                                    setYearsOfOperation(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="10+"
                                />
                              </div>
                            </>
                          )}

                          {/* Government Partner Specific Fields */}
                          {selectedRole === "government_partner" && (
                            <>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <Landmark className="w-3 h-3" /> Department
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={departmentName}
                                  onChange={(e) =>
                                    setDepartmentName(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="Ministry of Finance"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <MapPin className="w-3 h-3" /> Jurisdiction
                                </label>
                                <input
                                  type="text"
                                  value={jurisdiction}
                                  onChange={(e) =>
                                    setJurisdiction(e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="National / State"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                  <Eye className="w-3 h-3" /> Access Level
                                </label>
                                <input
                                  type="text"
                                  value="Read-Only"
                                  disabled
                                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {registerError && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                          {registerError}
                        </div>
                      )}

                      <GradientButton
                        type="submit"
                        className="w-full hover:scale-[1.02] transition-transform duration-300 mt-2"
                      >
                        Create Account
                      </GradientButton>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step: Authenticating */}
        {step === "authenticating" && selectedRole && (
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-10 shadow-xl overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

              <div className="relative text-center">
                {/* Animated Progress Ring */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />

                  {/* Background circle */}
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * authProgress) / 100}
                      className="transition-all duration-100 ease-linear"
                    />
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  Please wait while we authenticate your account
                </h3>
                <p className="text-muted-foreground">
                  Verifying details and permissions…
                </p>

                {/* Progress bar */}
                <div className="mt-8 h-2 bg-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${authProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(authProgress)}% complete
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Approved */}
        {step === "approved" && selectedRole && (
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-10 shadow-xl overflow-hidden">
              {/* Success glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-primary/10" />

              <div className="relative text-center">
                {/* Success icon */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Account Approved
                </h3>
                <p className="text-muted-foreground">
                  Redirecting to {roleLabels[selectedRole]} Dashboard...
                </p>

                {/* Loading dots */}
                <div className="flex justify-center gap-1 mt-4">
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Pending Verification */}
        {step === "pending" && selectedRole && (
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-10 shadow-xl overflow-hidden">
              {/* Warning glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-primary/10" />

              <div className="relative text-center">
                {/* Pending icon */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-warning/20 blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center border border-warning/30">
                    <Clock className="w-12 h-12 text-warning" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  🎉 Registration Successful!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your account awaits admin verification (usually &lt;24 hours).
                </p>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 mb-6">
                  <div className="flex items-center justify-center gap-2 text-warning">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      Status: Pending Approval
                    </span>
                  </div>
                </div>

                <Link to="/landing">
                  <GradientButton className="w-full">
                    Back to Home
                  </GradientButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </GridBackground>
  );
}
