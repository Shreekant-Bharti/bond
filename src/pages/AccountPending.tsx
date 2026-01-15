import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GridBackground } from "@/components/ui/grid-background";
import { GlowCard } from "@/components/ui/glow-card";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  Clock,
  CheckCircle,
  Home,
  Shield,
  Mail,
  RefreshCw,
} from "lucide-react";
import { getCurrentSession, getRegisteredUsers } from "@/lib/userStorage";

export default function AccountPending() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentSession());
  const [checking, setChecking] = useState(false);

  // Check verification status periodically
  useEffect(() => {
    const checkStatus = () => {
      const session = getCurrentSession();
      if (session) {
        const users = getRegisteredUsers();
        const currentUser = users.find((u) => u.id === session.id);

        if (currentUser?.verificationStatus === "verified") {
          // User is now verified - redirect to appropriate dashboard
          const routes: Record<string, string> = {
            investor: "/investor",
            broker: "/broker",
            lister: "/broker",
            custodian: "/custodian",
            financial_institution: "/fi",
            government_partner: "/gov",
          };
          navigate(
            routes[currentUser.displayRole] ||
              routes[currentUser.role] ||
              "/landing"
          );
        } else if (currentUser?.verificationStatus === "rejected") {
          navigate("/login");
        }

        setUser(currentUser || null);
      }
    };

    // Check immediately
    checkStatus();

    // Check every 5 seconds
    const interval = setInterval(checkStatus, 5000);

    // Listen for storage changes (cross-tab sync)
    const handleStorage = () => checkStatus();
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [navigate]);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const currentUser = user ? users.find((u) => u.id === user.id) : null;
      setUser(currentUser || null);
      setChecking(false);
    }, 1000);
  };

  return (
    <GridBackground className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
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

        <GlowCard className="p-8 text-center">
          {/* Pending Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/20 flex items-center justify-center animate-pulse">
            <Clock className="w-10 h-10 text-warning" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verification Pending
          </h1>
          <p className="text-muted-foreground mb-6">
            Your registration is under admin review.
          </p>

          {user && (
            <div className="mb-6 p-4 rounded-lg bg-muted/20 text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">Role: {user.displayRole}</span>
              </div>
            </div>
          )}

          {/* What happens next */}
          <div className="text-left space-y-4 mb-8">
            <h3 className="font-semibold text-foreground">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Admin KYC Review
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usually completed within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Notification on Approval
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You'll be notified once verified
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Full Dashboard Access
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Access all features after verification
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-4 py-2 rounded-full bg-warning/20 text-warning text-sm font-medium animate-pulse">
              Status: Pending Approval
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${checking ? "animate-spin" : ""}`}
              />
              {checking ? "Checking..." : "Check Status"}
            </button>
            <Link to="/landing" className="flex-1">
              <GradientButton className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </GradientButton>
            </Link>
          </div>
        </GlowCard>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This page will auto-refresh when your account is verified.
        </p>
      </div>
    </GridBackground>
  );
}
