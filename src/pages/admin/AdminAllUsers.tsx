import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  ArrowLeft,
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  Coins,
  DollarSign,
  TrendingUp,
  UserCheck,
  Briefcase,
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

interface InvestorDetails {
  userId: string;
  name: string;
  email: string;
  investments: {
    bondId: string;
    bondName: string;
    tokens: number;
    tokenId: string;
    amount: number;
    date: string;
  }[];
  totalInvested: number;
  totalTokens: number;
}

export default function AdminAllUsers() {
  const navigate = useNavigate();
  const { bonds, transactions } = useBondContext();
  const [admin, setAdmin] = useState(getCurrentSession());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvestor, setSelectedInvestor] =
    useState<InvestorDetails | null>(null);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || session.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    setAdmin(session);
  }, [navigate]);

  const users = getRegisteredUsers().filter((u) => u.role !== "admin");

  // Calculate user investments
  const calculateUserInvestments = (userId: string): number => {
    return transactions
      .filter(
        (t) =>
          (t.investorId === userId || t.toId === userId) &&
          t.type === "purchase" &&
          t.status === "completed"
      )
      .reduce((sum, t) => sum + t.value, 0);
  };

  // Calculate user tokens
  const calculateUserTokens = (userId: string): number => {
    return transactions
      .filter(
        (t) =>
          (t.investorId === userId || t.toId === userId) &&
          t.type === "purchase" &&
          t.status === "completed"
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get user's investment details
  const getUserInvestmentDetails = (
    userId: string
  ): InvestorDetails["investments"] => {
    return transactions
      .filter(
        (t) =>
          (t.investorId === userId || t.toId === userId) &&
          t.type === "purchase" &&
          t.status === "completed"
      )
      .map((t) => {
        const bond = bonds.find((b) => b.id === t.bondId);
        return {
          bondId: t.bondId,
          bondName: bond?.name || "Unknown Bond",
          tokens: t.amount,
          tokenId:
            t.tokenId ||
            `TKN-${t.bondId.slice(0, 4).toUpperCase()}-${Date.now()
              .toString(36)
              .toUpperCase()}`,
          amount: t.value,
          date: new Date(t.timestamp).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
      });
  };

  // Count bonds for listers
  const countListerBonds = (userId: string): number => {
    return bonds.filter((b) => b.listerId === userId).length;
  };

  // Count tokens sold for listers
  const countListerTokensSold = (userId: string): number => {
    const listerBonds = bonds.filter((b) => b.listerId === userId);
    return listerBonds.reduce(
      (sum, b) => sum + (b.totalSupply - b.availableSupply),
      0
    );
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.orgName?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.verificationStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const totalUsers = users.length;
  const investorCount = users.filter((u) => u.role === "investor").length;
  const listerCount = users.filter(
    (u) =>
      u.role === "broker" ||
      u.role === "custodian" ||
      u.role === "financial_institution" ||
      u.role === "government_partner"
  ).length;
  const pendingCount = users.filter(
    (u) => u.verificationStatus === "pending"
  ).length;
  const totalAUM = transactions
    .filter((t) => t.type === "purchase" && t.status === "completed")
    .reduce((sum, t) => sum + t.value, 0);

  const formatINR = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleViewDetails = (user: (typeof users)[0]) => {
    if (user.role === "investor") {
      const investments = getUserInvestmentDetails(user.id);
      setSelectedInvestor({
        userId: user.id,
        name: user.name || user.email,
        email: user.email,
        investments,
        totalInvested: calculateUserInvestments(user.id),
        totalTokens: calculateUserTokens(user.id),
      });
    }
  };

  const isLister = (role: string) =>
    [
      "broker",
      "custodian",
      "financial_institution",
      "government_partner",
    ].includes(role);

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">All Users</h1>
              <p className="text-xs text-muted-foreground">
                {totalUsers} registered users
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalUsers}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Investors</p>
                <p className="text-2xl font-bold text-foreground">
                  {investorCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Listers</p>
                <p className="text-2xl font-bold text-foreground">
                  {listerCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-primary/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total AUM</p>
                <p className="text-xl font-bold text-foreground">
                  {formatINR(totalAUM)}
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/20 border-border/50"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px] bg-muted/20 border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="custodian">Custodian</SelectItem>
              <SelectItem value="financial_institution">
                Financial Institution
              </SelectItem>
              <SelectItem value="government_partner">
                Government Partner
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-muted/20 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    ₹ Invested / Bonds
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Tokens
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <p className="font-medium text-foreground">
                        {user.name || user.orgName || "N/A"}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-muted-foreground text-sm">
                        {user.email}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {user.displayRole || user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          user.verificationStatus === "verified"
                            ? "bg-success/20 text-success"
                            : user.verificationStatus === "pending"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {user.verificationStatus === "verified" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {user.verificationStatus === "pending" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {user.verificationStatus === "rejected" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.role === "investor" ? (
                        <span className="text-foreground font-medium">
                          {formatINR(calculateUserInvestments(user.id))}
                        </span>
                      ) : isLister(user.role) ? (
                        <span className="text-foreground font-medium">
                          {countListerBonds(user.id)} bonds
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.role === "investor" ? (
                        <span className="text-foreground font-medium flex items-center gap-1">
                          <Coins className="w-4 h-4 text-primary" />
                          {calculateUserTokens(user.id)}
                        </span>
                      ) : isLister(user.role) ? (
                        <span className="text-foreground font-medium">
                          {countListerTokensSold(user.id)} sold
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.role === "investor" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                No users found matching your filters
              </p>
            </div>
          )}
        </Card>
      </main>

      {/* Investor Details Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {selectedInvestor.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedInvestor.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInvestor(null)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold text-primary">
                  {formatINR(selectedInvestor.totalInvested)}
                </p>
              </Card>
              <Card className="p-4 bg-success/5 border-success/20">
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold text-success flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  {selectedInvestor.totalTokens}
                </p>
              </Card>
            </div>

            {/* Investment Details Table */}
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Investment Breakdown
            </h4>
            {selectedInvestor.investments.length > 0 ? (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/20">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Bond
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Tokens
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
                    {selectedInvestor.investments.map((inv, idx) => (
                      <tr key={idx} className="border-t border-border/20">
                        <td className="p-3 font-medium text-foreground">
                          {inv.bondName}
                        </td>
                        <td className="p-3 text-foreground">{inv.tokens}</td>
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
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No investments yet</p>
              </Card>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
