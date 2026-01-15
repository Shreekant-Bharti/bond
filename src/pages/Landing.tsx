import { Link } from "react-router-dom";
import { GridBackground } from "@/components/ui/grid-background";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlowCard } from "@/components/ui/glow-card";
import { AarthaChatbot } from "@/components/ui/aartha-chatbot";
import { 
  Shield, Coins, TrendingUp, Globe, Calculator, ArrowRight, 
  Search, ChevronDown, Users, Layers, Eye, Lock, Wallet,
  ArrowRightLeft, CheckCircle2, Mail, MapPin, Clock
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const BONDS = [
  { id: 1, name: "5 Year Government Bond", yield: 7.5, duration: 5 },
  { id: 2, name: "10 Year Government Bond", yield: 8.2, duration: 10 },
  { id: 3, name: "Short Term Bond", yield: 6.8, duration: 2 },
];

const SEARCH_SUGGESTIONS = [
  "5 Year Government Bond",
  "10 Year Treasury Bond",
  "Low Risk Bonds",
  "High Yield Bonds",
  "Stablecoin Investments",
];

const CONVERSION_RATE = 83; // 1 USDT = ₹83

export default function Landing() {
  const [investment, setInvestment] = useState(10000);
  const [selectedBond, setSelectedBond] = useState(BONDS[0]);
  const [bondDropdownOpen, setBondDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USDT">("INR");
  
  const searchRef = useRef<HTMLDivElement>(null);
  const bondDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate returns based on selected bond
  const displayAmount = currency === "INR" ? investment : investment / CONVERSION_RATE;
  const investmentInUSDT = currency === "INR" ? investment / CONVERSION_RATE : investment;
  const returns = investmentInUSDT * Math.pow(1 + selectedBond.yield / 100, selectedBond.duration) - investmentInUSDT;
  const returnsDisplay = currency === "INR" ? returns * CONVERSION_RATE : returns;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (bondDropdownRef.current && !bondDropdownRef.current.contains(event.target as Node)) {
        setBondDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = SEARCH_SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GridBackground>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">BondFi</span>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search BondFi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            {/* Search Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2">
                  <p className="text-xs text-muted-foreground px-3 py-2">Popular Searches</p>
                  {filteredSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setSearchFocused(false);
                      }}
                    >
                      <Search className="w-3 h-3 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auth Button */}
          <div className="shrink-0">
            <Link to="/login">
              <button className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted/50 border border-border/50 rounded-lg hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 ease-in-out hover:scale-[1.02]">
                Login / Signup
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-6 animate-fade-in">
            <Globe className="w-4 h-4" />
            Powered by Blockchain Technology
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            Government Bonds,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Reimagined
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Access fractional government bonds using stablecoins. Transparent yields, institutional-grade security, blockchain efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/login">
              <GradientButton size="lg">
                Start Investing <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </Link>
            <GradientButton variant="outline" size="lg">Learn More</GradientButton>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of bond investment with our comprehensive feature set
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Layers, title: "Fractional Bonds", desc: "Own fractions of high-value government bonds starting from just $50" },
              { icon: Coins, title: "Stablecoin Access", desc: "Invest using USDT, USDC and other major stablecoins seamlessly" },
              { icon: Eye, title: "Yield Tracking", desc: "Real-time transparent tracking of your investment returns" },
              { icon: Users, title: "Role Dashboards", desc: "Dedicated interfaces for investors, brokers, and institutions" },
              { icon: Lock, title: "Blockchain Trust", desc: "Immutable records and cryptographic security for all transactions" },
            ].map((f, i) => (
              <GlowCard key={i} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How BondFi Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A seamless journey from stablecoins to government bond ownership
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your crypto wallet to access the BondFi platform securely" },
              { step: "02", title: "Choose Bonds", desc: "Browse available government bonds with transparent yield rates" },
              { step: "03", title: "Invest Stablecoins", desc: "Purchase bond fractions using USDT or other stablecoins" },
              { step: "04", title: "Earn Returns", desc: "Track your investments and earn yields automatically" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 left-0">{item.step}</div>
                <div className="pt-8 pl-2">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block absolute top-12 -right-3 w-6 h-6 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <GlowCard glowColor="secondary">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Returns Calculator</h2>
              </div>
              
              {/* Currency Toggle */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    currency === "INR" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ₹ INR
                </button>
                <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                <button
                  onClick={() => setCurrency("USDT")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    currency === "USDT" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  USDT
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Bond Selector */}
              <div ref={bondDropdownRef} className="relative">
                <label className="text-sm text-muted-foreground mb-2 block">Select Bond</label>
                <button
                  onClick={() => setBondDropdownOpen(!bondDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{selectedBond.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedBond.duration} Year • {selectedBond.yield}% APY</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${bondDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {bondDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                    {BONDS.map((bond) => (
                      <button
                        key={bond.id}
                        onClick={() => {
                          setSelectedBond(bond);
                          setBondDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors ${
                          selectedBond.id === bond.id ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{bond.name}</p>
                            <p className="text-xs text-muted-foreground">{bond.duration} Year Duration</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-success">{bond.yield}% APY</p>
                          {selectedBond.id === bond.id && (
                            <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Investment Amount */}
              <div>
                <label className="text-sm text-muted-foreground">
                  Investment Amount ({currency === "INR" ? "₹" : "$"})
                </label>
                <input
                  type="range" 
                  min={currency === "INR" ? 1000 : 50} 
                  max={currency === "INR" ? 500000 : 10000} 
                  step={currency === "INR" ? 1000 : 50} 
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-foreground">
                    {currency === "INR" ? "₹" : "$"}{displayAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ≈ {currency === "INR" 
                      ? `$${(investment / CONVERSION_RATE).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT` 
                      : `₹${(investment * CONVERSION_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    }
                  </p>
                </div>
              </div>

              {/* Duration Display */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bond Duration</span>
                  <span className="font-semibold text-foreground">{selectedBond.duration} Years</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Annual Yield</span>
                  <span className="font-semibold text-success">{selectedBond.yield}% APY</span>
                </div>
              </div>

              {/* Results */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Estimated Returns after {selectedBond.duration} years</p>
                <p className="text-4xl font-bold text-success">
                  {currency === "INR" ? "₹" : "$"}{returnsDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total Value: {currency === "INR" ? "₹" : "$"}
                  {(displayAmount + returnsDisplay).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Conversion Rate Notice */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                <ArrowRightLeft className="w-3 h-3" />
                Demo Rate: 1 USDT = ₹{CONVERSION_RATE}
              </div>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* Why BondFi */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose BondFi?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed for the next generation of investors
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Users, 
                title: "Built for Students", 
                desc: "Designed with young investors in mind. Learn while you earn with our intuitive platform.",
                highlight: "Education-first approach"
              },
              { 
                icon: Coins, 
                title: "Low Entry Barrier", 
                desc: "Start investing with as little as $50. No minimum lock-in periods for select bonds.",
                highlight: "Start from $50"
              },
              { 
                icon: Shield, 
                title: "Government-Backed", 
                desc: "All bonds are backed by government securities. Your investment is as safe as it gets.",
                highlight: "100% Secure"
              },
              { 
                icon: Lock, 
                title: "Blockchain Transparent", 
                desc: "Every transaction is recorded on-chain. Full transparency and immutable audit trails.",
                highlight: "On-chain verified"
              },
            ].map((item, i) => (
              <GlowCard key={i} className="group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {item.highlight}
                </span>
                <h3 className="text-lg font-semibold text-foreground mt-3 mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <GlowCard className="text-center py-12" glowColor="primary">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Investing?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of investors accessing government bonds on-chain. Start your journey today.
            </p>
            <Link to="/login">
              <GradientButton size="lg">
                Get Started <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </Link>
          </GlowCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/30 bg-gradient-to-b from-background via-background to-muted/20">
        {/* Top glow effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="container mx-auto px-6 pt-16 pb-8">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* About Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-foreground">BondFi</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                BondFi is a blockchain-enabled platform that makes government bonds accessible through fractional ownership, transparent returns, and secure stablecoin settlement.
              </p>
              
              {/* Trust Indicators */}
              <div className="space-y-2">
                {[
                  "Government bond–backed instruments",
                  "Secure, transparent, blockchain-powered",
                  "Designed for long-term investors"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {[
                  "How BondFi Works",
                  "Available Bonds",
                  "Secondary Market",
                  "Returns Calculator"
                ].map((link, i) => (
                  <li key={i}>
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 hover:translate-x-1 inline-block relative group">
                      {link}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {[
                  "About Us",
                  "Security & Trust",
                  "Compliance",
                  "Contact Support"
                ].map((link, i) => (
                  <li key={i}>
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 hover:translate-x-1 inline-block relative group">
                      {link}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {[
                  "Bond Education",
                  "FAQs",
                  "Risk Disclosure",
                  "Terms & Conditions"
                ].map((link, i) => (
                  <li key={i}>
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 hover:translate-x-1 inline-block relative group">
                      {link}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Support Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-border/30 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Support Email</p>
                <p className="text-sm font-medium text-foreground">support@bondfi.app</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Operating Region</p>
                <p className="text-sm font-medium text-foreground">India</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Support Hours</p>
                <p className="text-sm font-medium text-foreground">Mon–Fri | 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30 backdrop-blur-sm mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Risk Disclosure:</span> Investments involve market risks. Returns shown are indicative and based on historical data. Bond prices may fluctuate based on interest rate movements. Past performance does not guarantee future results. Please read all scheme-related documents carefully before investing.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              © 2026 BondFi. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-all duration-300 relative group">
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </span>
              <span className="hover:text-primary cursor-pointer transition-all duration-300 relative group">
                Terms of Service
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </span>
              <span className="hover:text-primary cursor-pointer transition-all duration-300 relative group">
                Cookie Policy
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Aartha Chatbot */}
      <AarthaChatbot />
    </GridBackground>
  );
}
