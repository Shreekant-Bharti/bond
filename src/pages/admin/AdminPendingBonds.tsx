import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Eye,
  Building2,
  RefreshCw,
  Loader2,
  Sliders,
} from "lucide-react";
import {
  getCurrentSession,
  addNotification,
  getRegisteredUsers,
} from "@/lib/userStorage";
import { useBondContext } from "@/context/BondContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { verifyBondWithAPI } from "@/lib/oracleService";

export default function AdminPendingBonds() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bonds, approveBond } = useBondContext();
  const [admin, setAdmin] = useState(getCurrentSession());
  const [rejectionModal, setRejectionModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedBond, setSelectedBond] = useState<string | null>(null);
  const [oracleScores, setOracleScores] = useState<Record<string, number>>({});
  const [verifyingBond, setVerifyingBond] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState<string | null>(null);
  const [customScore, setCustomScore] = useState(85);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || session.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    setAdmin(session);
  }, [navigate]);

  const pendingBonds = bonds.filter((b) => b.approvalStatus === "pending");
  const users = getRegisteredUsers();

  const getListerName = (listerId?: string) => {
    if (!listerId) return "Unknown";
    const user = users.find((u) => u.id === listerId);
    return user?.name || user?.orgName || user?.email || "Unknown";
  };

  // Re-verify bond with Oracle API (Admin only)
  const handleReVerify = async (bondId: string) => {
    setVerifyingBond(bondId);
    const result = await verifyBondWithAPI("ABCDE1234F", "admin");
    if (result) {
      setOracleScores((prev) => ({ ...prev, [bondId]: result.score }));
      toast({
        title: "Re-verification Complete",
        description: `Fresh Oracle Score: ${result.score}%`,
      });
    } else {
      toast({
        title: "Verification Failed",
        description: "Could not fetch oracle score",
        variant: "destructive",
      });
    }
    setVerifyingBond(null);
  };

  // Manual override score
  const handleOverrideScore = (bondId: string, score: number) => {
    setOracleScores((prev) => ({ ...prev, [bondId]: score }));
    setOverrideModal(null);
    toast({
      title: "Score Override Applied",
      description: `Oracle score manually set to ${score}%`,
    });
  };

  const getOracleScore = (bondId: string): number => {
    return oracleScores[bondId] || Math.floor(Math.random() * 15) + 80; // Default 80-95
  };

  const handleApprove = (bondId: string) => {
    if (!admin) return;

    const bond = bonds.find((b) => b.id === bondId);
    const result = approveBond(bondId, true);

    if (result.success && bond?.listerId) {
      // Add notification for the lister
      addNotification({
        userId: bond.listerId,
        message: `Your bond "${bond.name}" has been approved and is now live on the investor market!`,
        type: "success",
        bondId: bondId,
      });

      toast({
        title: "Bond Approved",
        description: `${bond.name} is now available for investors.`,
      });
    }
  };

  const handleReject = (bondId: string) => {
    if (!admin) return;

    const bond = bonds.find((b) => b.id === bondId);
    const result = approveBond(bondId, false);

    if (result.success && bond?.listerId) {
      // Add notification for the lister
      addNotification({
        userId: bond.listerId,
        message: `Your bond "${bond.name}" was rejected. Reason: ${
          rejectionReason || "Not specified"
        }`,
        type: "error",
        bondId: bondId,
      });

      toast({
        title: "Bond Rejected",
        description: `${bond.name} has been rejected.`,
        variant: "destructive",
      });
    }

    setRejectionModal(null);
    setRejectionReason("");
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  const selectedBondData = selectedBond
    ? bonds.find((b) => b.id === selectedBond)
    : null;

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Pending Bond Approvals
              </h1>
              <p className="text-xs text-muted-foreground">
                {pendingBonds.length} bonds awaiting approval
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {pendingBonds.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-card/40">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              All Caught Up!
            </h3>
            <p className="text-muted-foreground">
              No pending bond approvals at the moment.
            </p>
            <Link to="/admin/dashboard">
              <Button className="mt-6" variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Bond
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Lister
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Oracle Score
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Face Value
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Yield
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBonds.map((bond, index) => (
                    <tr
                      key={bond.id}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {bond.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bond.issuer}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {getListerName(bond.listerId)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-semibold",
                              getOracleScore(bond.id) >= 80
                                ? "bg-success/20 text-success"
                                : "bg-warning/20 text-warning"
                            )}
                          >
                            {getOracleScore(bond.id)}%
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReVerify(bond.id)}
                            disabled={verifyingBond === bond.id}
                            className="h-7 px-2"
                            title="Re-verify with API"
                          >
                            {verifyingBond === bond.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setOverrideModal(bond.id)}
                            className="h-7 px-2"
                            title="Override score"
                          >
                            <Sliders className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          {formatCurrency(bond.value * bond.totalSupply)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-success font-semibold flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          {bond.yield}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBond(bond.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(bond.id)}
                            className="bg-success hover:bg-success/90 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectionModal(bond.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Bond Details Modal */}
      {selectedBondData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 bg-card max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Bond Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBond(null)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bond Name</p>
                  <p className="font-medium text-foreground">
                    {selectedBondData.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issuer</p>
                  <p className="font-medium text-foreground">
                    {selectedBondData.issuer}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lister</p>
                  <p className="font-medium text-foreground">
                    {getListerName(selectedBondData.listerId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lister Type</p>
                  <p className="font-medium text-foreground">
                    {selectedBondData.listerSubType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Yield</p>
                  <p className="font-medium text-success">
                    {selectedBondData.yield}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tenure</p>
                  <p className="font-medium text-foreground">
                    {selectedBondData.tenure} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Face Value</p>
                  <p className="font-medium text-foreground">
                    ${selectedBondData.value.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="font-medium text-foreground">
                    {selectedBondData.totalSupply.toLocaleString()} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(
                      selectedBondData.value * selectedBondData.totalSupply
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maturity Date</p>
                  <p className="font-medium text-foreground">
                    {selectedBondData.maturityDate}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-foreground">
                  {selectedBondData.description}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <Button
                className="flex-1 bg-success hover:bg-success/90 text-white"
                onClick={() => {
                  handleApprove(selectedBondData.id);
                  setSelectedBond(null);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Bond
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setSelectedBond(null);
                  setRejectionModal(selectedBondData.id);
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Bond
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Reject Bond
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejection (will be sent to lister):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Enter rejection reason..."
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRejectionModal(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleReject(rejectionModal)}
              >
                Confirm Reject
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Score Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Override Oracle Score
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set a custom verification score for this bond:
            </p>

            {/* Quick Score Buttons */}
            <div className="flex gap-2 mb-4">
              {[80, 85, 90, 95].map((score) => (
                <Button
                  key={score}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOverrideScore(overrideModal, score)}
                  className={cn(
                    "flex-1",
                    score >= 80 && "hover:bg-success/20 hover:border-success"
                  )}
                >
                  {score}%
                </Button>
              ))}
            </div>

            {/* Custom Score Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={customScore}
                onChange={(e) => setCustomScore(Number(e.target.value))}
                min={0}
                max={100}
                className="flex-1 p-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Custom score"
              />
              <Button
                onClick={() => handleOverrideScore(overrideModal, customScore)}
                className="bg-primary"
              >
                Apply
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOverrideModal(null)}
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
