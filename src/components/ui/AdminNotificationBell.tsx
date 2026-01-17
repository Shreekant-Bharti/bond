/**
 * AdminNotificationBell Component
 * Shows notifications specifically for admin users including:
 * - New bond listing requests from listers
 * - Oracle score updates for pending bonds
 * - New user registration requests
 *
 * NOTE: Admin notifications are stored separately and aggregated from
 * pending bonds and users in the system.
 */

import { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  FileText,
  Users,
  Shield,
} from "lucide-react";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  getCurrentSession,
  AdminNotification,
} from "@/lib/userStorage";
import { cn } from "@/lib/utils";

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const currentUser = getCurrentSession();

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      const loadNotifications = () => {
        const adminNotifications = getAdminNotifications();
        setNotifications(
          adminNotifications.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      };

      loadNotifications();

      // Poll for new notifications every 3 seconds
      const interval = setInterval(loadNotifications, 3000);

      // Listen for storage changes
      const handleStorage = () => loadNotifications();
      window.addEventListener("storage", handleStorage);

      return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notificationId: string) => {
    markAdminNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    markAllAdminNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: AdminNotification["type"]) => {
    switch (type) {
      case "new_bond_request":
        return <FileText className="w-4 h-4 text-amber-500" />;
      case "oracle_update":
        return <Shield className="w-4 h-4 text-primary" />;
      case "new_user_request":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "bond_edit_request":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!currentUser || currentUser.role !== "admin") return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
        title="Admin Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[70vh] overflow-hidden rounded-xl bg-card border border-border shadow-xl z-50 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-destructive" />
                <h3 className="font-semibold text-foreground">
                  Admin Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-muted/50"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">
                    You'll see bond requests and user registrations here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={cn(
                        "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/30",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm",
                              !notification.read
                                ? "font-semibold text-foreground"
                                : "text-foreground/80"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
