import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Mail,
  Calendar,
  Building2,
  User,
} from "lucide-react";
import {
  getCurrentSession,
  getRegisteredUsers,
  verifyUser,
  addNotification,
} from "@/lib/userStorage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AdminNotificationBell } from "@/components/ui/AdminNotificationBell";

export default function AdminPendingUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admin, setAdmin] = useState(getCurrentSession());
  const [users, setUsers] = useState(getRegisteredUsers());
  const [rejectionModal, setRejectionModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || session.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    setAdmin(session);
  }, [navigate]);

  const pendingUsers = users.filter(
    (u) => u.verificationStatus === "pending" && u.role !== "admin"
  );

  const handleVerify = (userId: string) => {
    if (!admin) return;

    const result = verifyUser(userId, admin.id, true);
    if (result.success) {
      const user = users.find((u) => u.id === userId);

      // Add notification for the user
      addNotification({
        userId: userId,
        message:
          "Your account has been verified! You can now access your dashboard.",
        type: "success",
      });

      toast({
        title: "User Verified",
        description: `${
          user?.name || user?.email
        } has been verified successfully.`,
      });

      setUsers(getRegisteredUsers());
    }
  };

  const handleReject = (userId: string) => {
    if (!admin) return;

    const result = verifyUser(
      userId,
      admin.id,
      false,
      rejectionReason || "Account verification rejected"
    );
    if (result.success) {
      const user = users.find((u) => u.id === userId);

      // Add notification for the user
      addNotification({
        userId: userId,
        message: `Your account verification was rejected. Reason: ${
          rejectionReason || "Not specified"
        }`,
        type: "error",
      });

      toast({
        title: "User Rejected",
        description: `${user?.name || user?.email} has been rejected.`,
        variant: "destructive",
      });

      setUsers(getRegisteredUsers());
      setRejectionModal(null);
      setRejectionReason("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Pending User Verifications
              </h1>
              <p className="text-xs text-muted-foreground">
                {pendingUsers.length} users awaiting verification
              </p>
            </div>
          </div>
          <AdminNotificationBell />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {pendingUsers.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-card/40">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              All Caught Up!
            </h3>
            <p className="text-muted-foreground">
              No pending user verifications at the moment.
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
                      User
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Registered
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              user.displayRole === "investor"
                                ? "bg-primary/20"
                                : "bg-secondary/20"
                            )}
                          >
                            {user.displayRole === "investor" ? (
                              <User className="w-5 h-5 text-primary" />
                            ) : (
                              <Building2 className="w-5 h-5 text-secondary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.name || user.orgName || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium capitalize",
                            user.displayRole === "investor"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/20 text-secondary"
                          )}
                        >
                          {user.displayRole}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerify(user.id)}
                            className="bg-success hover:bg-success/90 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectionModal(user.id)}
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

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Reject User
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejection (optional):
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
    </div>
  );
}
