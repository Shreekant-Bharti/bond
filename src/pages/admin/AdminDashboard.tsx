import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PieChart,
  Coins,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  getCurrentSession,
  clearCurrentSession,
  getRegisteredUsers,
} from "@/lib/userStorage";
import { useBondContext } from "@/context/BondContext";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { bonds, transactions } = useBondContext();
  const [admin, setAdmin] = useState(getCurrentSession());

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || session.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    setAdmin(session);
  }, [navigate]);

  const handleLogout = () => {
    clearCurrentSession();
    navigate("/admin/login");
  };

  const users = getRegisteredUsers();
  const pendingUsers = users.filter(
    (u) => u.verificationStatus === "pending" && u.role !== "admin"
  );
  const verifiedUsers = users.filter(
    (u) => u.verificationStatus === "verified" && u.role !== "admin"
  );
  const pendingBonds = bonds.filter((b) => b.approvalStatus === "pending");
  const approvedBonds = bonds.filter((b) => b.approvalStatus === "approved");

  // Calculate token analytics
  const totalTokensSold = bonds.reduce(
    (sum, b) => sum + (b.totalSupply - b.availableSupply),
    0
  );
  const activeBondsWithSales = bonds.filter(
    (b) => b.totalSupply - b.availableSupply > 0
  ).length;
  const activeListers = users.filter(
    (u) =>
      u.verificationStatus === "verified" &&
      (u.role === "broker" ||
        u.role === "custodian" ||
        u.role === "financial_institution" ||
        u.role === "government_partner")
  ).length;
  const highYieldBonds = approvedBonds.filter((b) => b.yield >= 7).length;

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                BondFi Admin
              </h1>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Dashboard Overview
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-5 bg-gradient-to-br from-warning/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {pendingUsers.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Bonds</p>
                <p className="text-3xl font-bold text-foreground">
                  {pendingBonds.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-success/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {verifiedUsers.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Listed Bonds</p>
                <p className="text-3xl font-bold text-foreground">
                  {approvedBonds.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Token & Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tokens Sold</p>
                <p className="text-3xl font-bold text-foreground">
                  {totalTokensSold.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Listers</p>
                <p className="text-3xl font-bold text-foreground">
                  {activeListers}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  High Yield Bonds
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {highYieldBonds}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-pink-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Bonds with Sales
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {activeBondsWithSales}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Users Card */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-foreground">
                  Pending User Verifications
                </h3>
              </div>
              {pendingUsers.length > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning animate-pulse">
                  {pendingUsers.length} pending
                </span>
              )}
            </div>

            {pendingUsers.length > 0 ? (
              <div className="space-y-3 mb-4">
                {pendingUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {user.name || user.orgName || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.displayRole} • {user.email}
                      </p>
                    </div>
                    <span className="text-xs text-warning">Pending</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-4">
                No pending verifications
              </p>
            )}

            <Link to="/admin/pending-users">
              <Button className="w-full" variant="outline">
                View All Pending Users
              </Button>
            </Link>
          </Card>

          {/* Pending Bonds Card */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Pending Bond Approvals
                </h3>
              </div>
              {pendingBonds.length > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-500 animate-pulse">
                  {pendingBonds.length} pending
                </span>
              )}
            </div>

            {pendingBonds.length > 0 ? (
              <div className="space-y-3 mb-4">
                {pendingBonds.slice(0, 3).map((bond) => (
                  <div
                    key={bond.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <div>
                      <p className="font-medium text-foreground">{bond.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bond.issuer} • {bond.yield}% yield
                      </p>
                    </div>
                    <span className="text-xs text-amber-500">Pending</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-4">
                No pending bond approvals
              </p>
            )}

            <Link to="/admin/pending-bonds">
              <Button className="w-full" variant="outline">
                View All Pending Bonds
              </Button>
            </Link>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link to="/admin/pending-users" className="block">
            <Card
              className={cn(
                "p-4 text-center hover:border-primary/50 transition-all cursor-pointer",
                pendingUsers.length > 0 && "border-warning/50"
              )}
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Pending Users</p>
            </Card>
          </Link>
          <Link to="/admin/pending-bonds" className="block">
            <Card
              className={cn(
                "p-4 text-center hover:border-primary/50 transition-all cursor-pointer",
                pendingBonds.length > 0 && "border-amber-500/50"
              )}
            >
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Pending Bonds</p>
            </Card>
          </Link>
          <Link to="/admin/token-analytics" className="block">
            <Card className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer border-purple-500/30">
              <PieChart className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Token Analytics</p>
            </Card>
          </Link>
          <Link to="/admin/all-users" className="block">
            <Card className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">All Users</p>
            </Card>
          </Link>
          <Link to="/admin/bond-analytics" className="block">
            <Card className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Bond Analytics</p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
