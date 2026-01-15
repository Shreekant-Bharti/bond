import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GridBackground } from "@/components/ui/grid-background";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Shield } from "lucide-react";
import {
  authenticateUser,
  setCurrentSession,
  initializeDefaultAdmin,
} from "@/lib/userStorage";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize default admin on component mount
  useState(() => {
    initializeDefaultAdmin();
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    const result = authenticateUser(email, password);

    if (!result.success || !result.user) {
      setError(result.error || "Login failed");
      return;
    }

    if (result.user.role !== "admin") {
      setError("Access denied. Admin credentials required.");
      return;
    }

    setCurrentSession(result.user);

    toast({
      title: "Admin Login Successful",
      description: "Welcome to the admin dashboard",
    });

    navigate("/admin/dashboard");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300";

  return (
    <GridBackground className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-lg shadow-destructive/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">BondFi</span>
            <span className="text-sm text-destructive ml-2 font-semibold">
              ADMIN
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-destructive/10 via-transparent to-destructive/5 opacity-50" />

          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Admin Portal
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Internal access only
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="admin@bondfi.com"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <GradientButton
                type="submit"
                className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
              >
                Login to Admin
              </GradientButton>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                Default: admin@bondfi.com / admin123
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/landing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </GridBackground>
  );
}
