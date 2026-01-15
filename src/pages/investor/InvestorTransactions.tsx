import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { FileText, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

export default function InvestorTransactions() {
  const { transactions, investor, bonds } = useBondContext();
  // Filter transactions where this investor is involved
  const investorTx = transactions
    .filter(
      (t) =>
        t.investorId === investor.id ||
        t.fromId === investor.id ||
        t.toId === investor.id
    )
    .reverse();

  const getBondName = (bondId: string) => {
    const bond = bonds.find((b) => b.id === bondId);
    return bond?.name || bondId;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Your complete transaction history"
    >
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Transaction History
            </h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {investorTx.length} transactions
          </span>
        </div>

        {investorTx.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Bond
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Token ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Units
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {investorTx.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "purchase"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-success/20 text-success"
                          }`}
                        >
                          {tx.type === "purchase" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-foreground capitalize">
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-foreground">
                      {getBondName(tx.bondId)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono">
                        {tx.tokenId || "N/A"}
                      </span>
                    </td>
                    <td className="p-3 text-foreground">{tx.amount}</td>
                    <td className="p-3">
                      <span
                        className={
                          tx.type === "purchase"
                            ? "text-destructive"
                            : "text-success"
                        }
                      >
                        {tx.type === "purchase" ? "-" : "+"}$
                        {tx.value.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
