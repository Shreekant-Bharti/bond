import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ArrowLeft,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  Coins,
  BarChart3,
} from "lucide-react";
import { getCurrentSession, getRegisteredUsers } from "@/lib/userStorage";
import { useBondContext } from "@/context/BondContext";

interface TokenData {
  bondId: string;
  bondName: string;
  totalSupply: number;
  soldTokens: number;
  percentSold: number;
  avgTokenPrice: number;
  investors: { name: string; tokens: number }[];
}

export default function AdminTokenAnalytics() {
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

  const users = getRegisteredUsers();

  // Calculate token analytics from transactions
  const calculateTokenAnalytics = (): TokenData[] => {
    const tokenMap: Record<
      string,
      {
        soldTokens: number;
        totalValue: number;
        investors: Record<string, number>;
      }
    > = {};

    // Aggregate purchase transactions
    transactions
      .filter((t) => t.type === "purchase" && t.status === "completed")
      .forEach((t) => {
        if (!tokenMap[t.bondId]) {
          tokenMap[t.bondId] = {
            soldTokens: 0,
            totalValue: 0,
            investors: {},
          };
        }
        tokenMap[t.bondId].soldTokens += t.amount;
        tokenMap[t.bondId].totalValue += t.value;

        // Track investor purchases
        const investorId = t.investorId || t.toId || "unknown";
        if (!tokenMap[t.bondId].investors[investorId]) {
          tokenMap[t.bondId].investors[investorId] = 0;
        }
        tokenMap[t.bondId].investors[investorId] += t.amount;
      });

    // Build token data array
    return bonds
      .filter((b) => b.approvalStatus === "approved")
      .map((bond) => {
        const data = tokenMap[bond.id] || {
          soldTokens: 0,
          totalValue: 0,
          investors: {},
        };
        const soldTokens = bond.totalSupply - bond.availableSupply;
        const avgPrice =
          soldTokens > 0 ? data.totalValue / soldTokens : bond.minInvestment;

        // Get top investors
        const investorList = Object.entries(data.investors)
          .map(([investorId, tokens]) => {
            const user = users.find((u) => u.id === investorId);
            return {
              name: user?.name || user?.email || "Investor",
              tokens,
            };
          })
          .sort((a, b) => b.tokens - a.tokens)
          .slice(0, 3);

        return {
          bondId: bond.id,
          bondName: bond.name,
          totalSupply: bond.totalSupply,
          soldTokens,
          percentSold: (soldTokens / bond.totalSupply) * 100,
          avgTokenPrice: avgPrice,
          investors: investorList,
        };
      });
  };

  const tokenData = calculateTokenAnalytics();
  const totalTokensSold = tokenData.reduce((sum, t) => sum + t.soldTokens, 0);
  const totalAUM = tokenData.reduce(
    (sum, t) => sum + t.soldTokens * t.avgTokenPrice,
    0
  );
  const activeBonds = tokenData.filter((t) => t.soldTokens > 0).length;

  // Pie chart data for visualization
  const pieChartData = tokenData
    .filter((t) => t.soldTokens > 0)
    .map((t) => ({
      name: t.bondName,
      value: t.soldTokens,
      percent:
        totalTokensSold > 0
          ? ((t.soldTokens / totalTokensSold) * 100).toFixed(1)
          : 0,
    }));

  const colors = [
    "bg-primary",
    "bg-success",
    "bg-warning",
    "bg-destructive",
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Token Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Bond token distribution & metrics
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-gradient-to-br from-primary/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Tokens Sold
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {totalTokensSold.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-success/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform AUM</p>
                <p className="text-3xl font-bold text-foreground">
                  ${totalAUM.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-warning/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Bonds</p>
                <p className="text-3xl font-bold text-foreground">
                  {activeBonds}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-card/40 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Token Price</p>
                <p className="text-3xl font-bold text-foreground">
                  $
                  {totalTokensSold > 0
                    ? (totalAUM / totalTokensSold).toFixed(2)
                    : "0"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Token Distribution Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Token Distribution
              </h3>
            </div>

            {pieChartData.length > 0 ? (
              <div className="space-y-4">
                {/* Visual Pie Chart representation */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {totalTokensSold.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Tokens
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {pieChartData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            colors[index % colors.length]
                          }`}
                        />
                        <span className="text-foreground font-medium">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-foreground font-bold">
                          {item.value.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({item.percent}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No token sales data available yet
                </p>
              </div>
            )}
          </Card>

          {/* Bond Performance */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold text-foreground">
                Bond Performance
              </h3>
            </div>

            <div className="space-y-4">
              {tokenData.slice(0, 5).map((bond) => (
                <div
                  key={bond.bondId}
                  className="p-4 rounded-lg bg-muted/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {bond.bondName}
                    </span>
                    <span className="text-sm text-success font-medium">
                      {bond.percentSold.toFixed(1)}% sold
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(bond.percentSold, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {bond.soldTokens.toLocaleString()} /{" "}
                      {bond.totalSupply.toLocaleString()} tokens
                    </span>
                    <span>Avg: ${bond.avgTokenPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Detailed Bond Token Table */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="p-6 border-b border-border/30">
            <h3 className="text-lg font-semibold text-foreground">
              Bond Token Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Bond Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Total Supply
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Sold Tokens
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    % Sold
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Avg Price
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Top Investors
                  </th>
                </tr>
              </thead>
              <tbody>
                {tokenData.map((bond, index) => (
                  <tr
                    key={bond.bondId}
                    className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        {bond.bondName}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">
                      {bond.totalSupply.toLocaleString()}
                    </td>
                    <td className="p-4 text-foreground">
                      {bond.soldTokens.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${
                          bond.percentSold > 50
                            ? "text-success"
                            : bond.percentSold > 20
                            ? "text-warning"
                            : "text-muted-foreground"
                        }`}
                      >
                        {bond.percentSold.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-foreground">
                      ${bond.avgTokenPrice.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {bond.investors.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {bond.investors.map((inv, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {inv.name}({inv.tokens})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No investors yet
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
