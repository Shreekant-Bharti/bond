import { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getCurrentSession,
} from "@/lib/userStorage";
import { Notification } from "@/types/bond";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentUser = getCurrentSession();

  useEffect(() => {
    if (currentUser) {
      const loadNotifications = () => {
        const userNotifications = getNotifications(currentUser.id);
        setNotifications(
          userNotifications.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      };

      loadNotifications();

      // Poll for new notifications every 5 seconds
      const interval = setInterval(loadNotifications, 5000);

      // Listen for storage changes
      const handleStorage = () => loadNotifications();
      window.addEventListener("storage", handleStorage);

      return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, [currentUser?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notificationId: string) => {
    markNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
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

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
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

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm text-foreground",
                              !notification.read && "font-medium"
                            )}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
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
