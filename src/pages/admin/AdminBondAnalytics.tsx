import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  BarChart3,
  Search,
  Filter,
  Eye,
  PieChart,
  TrendingUp,
  Coins,
  DollarSign,
  Percent,
  Users,
  XCircle,
  Building2,
} from "lucide-react";
import { getCurrentSession, getRegisteredUsers } from "@/lib/userStorage";
import { useBondContext } from "@/context/BondContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BondInvestor {
  investorId: string;
  investorName: string;
  tokens: number;
  tokenId: string;
  amount: number;
  date: string;
}

export default function AdminBondAnalytics() {
  const navigate = useNavigate();
  const { bonds, transactions } = useBondContext();
  const [admin, setAdmin] = useState(getCurrentSession());
  const [searchQuery, setSearchQuery] = useState("");
  const [listerFilter, setListerFilter] = useState("all");
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null);
  const [bondInvestors, setBondInvestors] = useState<BondInvestor[]>([]);

  const users = getRegisteredUsers();

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || session.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    setAdmin(session);
  }, [navigate]);

  // Get lister name
  const getListerName = (listerId?: string) => {
    if (!listerId) return "Unknown";
    const user = users.find((u) => u.id === listerId);
    return user?.name || user?.orgName || user?.email || "Unknown";
  };

  // Get investor name
  const getInvestorName = (investorId: string) => {
    const user = users.find((u) => u.id === investorId);
    return user?.name || user?.email || "Investor";
  };

  // Calculate bond stats
  const calculateBondStats = (bondId: string) => {
    const bondTx = transactions.filter(
      (t) =>
        t.bondId === bondId && t.type === "purchase" && t.status === "completed"
    );
    return {
      tokensSold: bondTx.reduce((sum, t) => sum + t.amount, 0),
      revenue: bondTx.reduce((sum, t) => sum + t.value, 0),
      investorCount: new Set(bondTx.map((t) => t.investorId || t.toId)).size,
    };
  };

  // Get bond investors
  const getBondInvestors = (bondId: string): BondInvestor[] => {
    return transactions
      .filter(
        (t) =>
          t.bondId === bondId &&
          t.type === "purchase" &&
          t.status === "completed"
      )
      .map((t) => ({
        investorId: t.investorId || t.toId || "unknown",
        investorName: getInvestorName(t.investorId || t.toId || ""),
        tokens: t.amount,
        tokenId:
          t.tokenId ||
          `TKN-${bondId.slice(0, 4).toUpperCase()}-${Date.now()
            .toString(36)
            .toUpperCase()}`,
        amount: t.value,
        date: new Date(t.timestamp).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }))
      .sort((a, b) => b.tokens - a.tokens);
  };

  // Get unique listers
  const uniqueListers = Array.from(
    new Set(bonds.filter((b) => b.listerId).map((b) => b.listerId))
  );

  // Filter bonds
  const filteredBonds = bonds
    .filter((b) => b.approvalStatus === "approved")
    .filter((bond) => {
      const matchesSearch = bond.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLister =
        listerFilter === "all" || bond.listerId === listerFilter;
      return matchesSearch && matchesLister;
    });

  // Calculate totals
  const totalAUM = filteredBonds.reduce((sum, b) => {
    const stats = calculateBondStats(b.id);
    return sum + stats.revenue;
  }, 0);

  const totalTokensSold = filteredBonds.reduce((sum, b) => {
    const stats = calculateBondStats(b.id);
    return sum + stats.tokensSold;
  }, 0);

  const avgYield =
    filteredBonds.length > 0
      ? filteredBonds.reduce((sum, b) => sum + b.yield, 0) /
        filteredBonds.length
      : 0;

  const formatINR = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleViewInvestors = (bondId: string) => {
    setSelectedBondId(bondId);
    setBondInvestors(getBondInvestors(bondId));
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Bond Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                {filteredBonds.length} listed bonds
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform AUM</p>
                <p className="text-xl font-bold text-foreground">
                  {formatINR(totalAUM)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tokens Sold</p>
                <p className="text-xl font-bold text-foreground">
                  {totalTokensSold.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-success/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Yield</p>
                <p className="text-xl font-bold text-foreground">
                  {avgYield.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Bonds</p>
                <p className="text-xl font-bold text-foreground">
                  {filteredBonds.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bonds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/20 border-border/50"
            />
          </div>
          <Select value={listerFilter} onValueChange={setListerFilter}>
            <SelectTrigger className="w-[200px] bg-muted/20 border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Lister" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listers</SelectItem>
              {uniqueListers.map((listerId) => (
                <SelectItem key={listerId} value={listerId || ""}>
                  {getListerName(listerId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bonds Table */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Bond Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Lister
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Total Supply
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Tokens Sold
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    % Sold
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Revenue (₹)
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Avg Price
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBonds.map((bond, index) => {
                  const stats = calculateBondStats(bond.id);
                  const percentSold =
                    bond.totalSupply > 0
                      ? ((stats.tokensSold / bond.totalSupply) * 100).toFixed(1)
                      : "0";
                  const avgPrice =
                    stats.tokensSold > 0
                      ? (stats.revenue / stats.tokensSold).toFixed(2)
                      : bond.minInvestment.toFixed(2);

                  return (
                    <tr
                      key={bond.id}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {bond.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bond.issuer}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {getListerName(bond.listerId)}
                        </div>
                      </td>
                      <td className="p-4 text-foreground">
                        {bond.totalSupply.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Coins className="w-4 h-4 text-primary" />
                          {stats.tokensSold.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                              style={{
                                width: `${Math.min(
                                  parseFloat(percentSold),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              parseFloat(percentSold) > 50
                                ? "text-success"
                                : parseFloat(percentSold) > 20
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {percentSold}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground font-medium">
                        {formatINR(stats.revenue)}
                      </td>
                      <td className="p-4 text-foreground">₹{avgPrice}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewInvestors(bond.id)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Investors
                          </Button>
                          <Button size="sm" variant="ghost">
                            <PieChart className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBonds.length === 0 && (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No bonds found</p>
            </div>
          )}
        </Card>
      </main>

      {/* Bond Investors Modal */}
      {selectedBondId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {bonds.find((b) => b.id === selectedBondId)?.name} - Investors
                </h3>
                <p className="text-sm text-muted-foreground">
                  Top {Math.min(bondInvestors.length, 10)} investors
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBondId(null)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            {bondInvestors.length > 0 ? (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/20">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Investor
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Tokens Bought
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Token ID
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        ₹ Amount
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bondInvestors.slice(0, 10).map((inv, idx) => (
                      <tr key={idx} className="border-t border-border/20">
                        <td className="p-3 font-medium text-foreground">
                          {inv.investorName}
                        </td>
                        <td className="p-3 text-foreground flex items-center gap-1">
                          <Coins className="w-4 h-4 text-primary" />
                          {inv.tokens}
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs px-2 py-1 rounded bg-muted/30 text-muted-foreground">
                            {inv.tokenId}
                          </span>
                        </td>
                        <td className="p-3 text-foreground font-medium">
                          {formatINR(inv.amount)}
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          {inv.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="p-8 text-center bg-muted/10">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No investors yet for this bond
                </p>
              </Card>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
