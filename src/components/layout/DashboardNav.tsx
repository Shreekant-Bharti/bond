import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Building2,
  Shield,
  Landmark,
  Users,
  MessageSquare,
  Calculator,
  Store,
} from "lucide-react";
import { useBondContext } from "@/context/BondContext";
import { UserRole } from "@/types/bond";
import { NotificationBell } from "@/components/ui/NotificationBell";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  investor: [
    {
      label: "Dashboard",
      href: "/investor",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Available Bonds",
      href: "/investor/bonds",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "My Portfolio",
      href: "/investor/portfolio",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Secondary Market",
      href: "/investor/secondary-market",
      icon: <Store className="w-5 h-5" />,
    },
    {
      label: "Returns Calculator",
      href: "/investor/calculator",
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      label: "Wallet",
      href: "/investor/wallet",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      label: "Support",
      href: "/investor/support",
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ],
  broker: [
    {
      label: "Dashboard",
      href: "/broker",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Create Listing",
      href: "/broker/create",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Listed Bonds",
      href: "/broker/listings",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Active Investors",
      href: "/broker/investors",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Investor Demand",
      href: "/broker/demand",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Wallet",
      href: "/broker/wallet",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      label: "Profile",
      href: "/broker/profile",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      label: "Support",
      href: "/broker/support",
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ],
  custodian: [
    {
      label: "Dashboard",
      href: "/custodian",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Custody Holdings",
      href: "/custodian/holdings",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      label: "Settlements",
      href: "/custodian/settlements",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Investor View",
      href: "/custodian/investors",
      icon: <Users className="w-5 h-5" />,
    },
  ],
  financial_institution: [
    {
      label: "Dashboard",
      href: "/fi",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Issue Bond",
      href: "/fi/create",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "My Bonds",
      href: "/fi/bonds",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      label: "Distribution",
      href: "/fi/distribution",
      icon: <FileText className="w-5 h-5" />,
    },
  ],
  government_partner: [
    {
      label: "Dashboard",
      href: "/gov",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Bond Overview",
      href: "/gov/bonds",
      icon: <Landmark className="w-5 h-5" />,
    },
    {
      label: "Investments",
      href: "/gov/investments",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Compliance",
      href: "/gov/compliance",
      icon: <Shield className="w-5 h-5" />,
    },
  ],
};

const roleLabels: Record<UserRole, string> = {
  investor: "Investor",
  broker: "Lister",
  custodian: "Custodian",
  financial_institution: "Financial Institution",
  government_partner: "Government Partner",
};

export function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, investor } = useBondContext();

  if (!currentUser) return null;

  const items = navItems[currentUser.role];
  const displayName =
    currentUser.role === "investor"
      ? investor.name
      : roleLabels[currentUser.role];

  const handleLogout = () => {
    // Clear session data
    logout();
    // Clear any stored session flags
    localStorage.removeItem("bondfi_session");
    // Navigate to landing page
    navigate("/landing");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar backdrop-blur-xl z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  B
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">BondFi</span>
            </Link>
            {/* Notification Bell for Listers */}
            {currentUser.role === "broker" && <NotificationBell />}
          </div>
          <p className="text-sm text-foreground mt-3 font-medium">
            Welcome, {displayName.split(" ")[0]}
          </p>
          <p className="text-xs text-muted-foreground">
            {roleLabels[currentUser.role]}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Link
            to={`/${
              currentUser.role === "financial_institution"
                ? "fi"
                : currentUser.role === "government_partner"
                ? "gov"
                : currentUser.role
            }/settings`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              location.pathname.includes("/settings")
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
