// User Storage Management - Handles user-scoped data isolation

import {
  UserRole,
  Investor,
  Broker,
  BondPurchase,
  VerificationStatus,
  Notification,
} from "@/types/bond";
import {
  SecondaryMarketListing,
  BankAccount,
  WalletTransaction,
  BondListing,
} from "@/context/BondContext";

export interface RegisteredUser {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  role: UserRole | "admin";
  displayRole: "investor" | "lister" | "admin";
  createdAt: string;
  name?: string;
  country?: string;
  preferredCurrency?: "INR" | "USDT";
  orgName?: string;
  // NEW: Verification fields
  verificationStatus: VerificationStatus;
  verifiedByAdminId?: string | null;
  rejectionReason?: string | null;
}

export interface UserData {
  investor: Investor;
  broker: Broker;
  walletTransactions: WalletTransaction[];
  bankAccount: BankAccount | null;
  availableForPayout: number;
  listerBalance: number;
  secondaryMarketListings: SecondaryMarketListing[];
  listings: BondListing[];
}

const USERS_KEY = "bondfi_users";
const CURRENT_SESSION_KEY = "bondfi_current_session";
const NOTIFICATIONS_KEY = "bondfi_notifications";

// Generate unique user ID
export function generateUserId(role: "investor" | "lister" | "admin"): string {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const prefix = role === "investor" ? "INV" : role === "admin" ? "ADM" : "LST";
  return `${prefix}-${year}-${randomPart}`;
}

// Get all registered users
export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save registered users
function saveRegisteredUsers(users: RegisteredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Find user by email
export function findUserByEmail(email: string): RegisteredUser | undefined {
  const users = getRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Find user by ID
export function findUserById(id: string): RegisteredUser | undefined {
  const users = getRegisteredUsers();
  return users.find((u) => u.id === id);
}

// Register a new user
export function registerUser(
  userData: Omit<
    RegisteredUser,
    | "id"
    | "createdAt"
    | "verificationStatus"
    | "verifiedByAdminId"
    | "rejectionReason"
  >
): { success: boolean; user?: RegisteredUser; error?: string } {
  const users = getRegisteredUsers();

  // Check if email already exists
  if (
    users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())
  ) {
    return { success: false, error: "Email already registered" };
  }

  const displayRole =
    userData.role === "investor"
      ? "investor"
      : userData.role === "admin"
      ? "admin"
      : "lister";
  const newUser: RegisteredUser = {
    ...userData,
    id: generateUserId(displayRole),
    createdAt: new Date().toISOString(),
    // NEW: Set verification status - admins are auto-verified, others are pending
    verificationStatus: userData.role === "admin" ? "verified" : "pending",
    verifiedByAdminId: null,
    rejectionReason: null,
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Initialize empty user data
  initializeUserData(
    newUser.id,
    userData.role as UserRole,
    userData.name,
    userData.country,
    userData.preferredCurrency
  );

  return { success: true, user: newUser };
}

// Authenticate user
export function authenticateUser(
  email: string,
  password: string
): { success: boolean; user?: RegisteredUser; error?: string } {
  const user = findUserByEmail(email);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.password !== password) {
    return { success: false, error: "Invalid password" };
  }

  return { success: true, user };
}

// Get user-specific storage key
export function getUserStorageKey(userId: string): string {
  return `bondfi_user_${userId}`;
}

// Initialize empty user data for a new user
export function initializeUserData(
  userId: string,
  role: UserRole,
  name?: string,
  country?: string,
  preferredCurrency?: "INR" | "USDT"
): void {
  const emptyInvestor: Investor = {
    id: userId,
    name: name || "New Investor",
    email: "",
    role: "investor",
    balance: 0, // Start with zero balance
    totalInvested: 0,
    totalReturns: 0,
    purchases: [],
    createdAt: new Date().toISOString(),
    country: country || "",
    preferredCurrency: preferredCurrency || "USDT",
  };

  const emptyBroker: Broker = {
    id: userId,
    name: name || "New Lister",
    email: "",
    role: "broker",
    listedBonds: [],
    totalListings: 0,
    transactionVolume: 0,
    createdAt: new Date().toISOString(),
  };

  const userData: UserData = {
    investor: emptyInvestor,
    broker: emptyBroker,
    walletTransactions: [],
    bankAccount: null,
    availableForPayout: 0,
    listerBalance: 0,
    secondaryMarketListings: [],
    listings: [],
  };

  localStorage.setItem(getUserStorageKey(userId), JSON.stringify(userData));
}

// Load user data
export function loadUserData(userId: string): UserData | null {
  try {
    const stored = localStorage.getItem(getUserStorageKey(userId));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Save user data
export function saveUserData(userId: string, data: UserData): void {
  localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
}

// Set current session
export function setCurrentSession(user: RegisteredUser): void {
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
}

// Get current session
export function getCurrentSession(): RegisteredUser | null {
  try {
    const stored = localStorage.getItem(CURRENT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Clear current session
export function clearCurrentSession(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

// Check if user is demo user (uses pre-filled credentials)
export function isDemoUser(email: string): boolean {
  return email.endsWith("@bondfi.demo");
}
// Admin functions
export function getPendingUsers(): RegisteredUser[] {
  return getRegisteredUsers().filter((u) => u.verificationStatus === "pending");
}

export function verifyUser(
  userId: string,
  adminId: string,
  approved: boolean,
  rejectionReason?: string
): { success: boolean; error?: string } {
  const users = getRegisteredUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }

  users[userIndex] = {
    ...users[userIndex],
    verificationStatus: approved ? "verified" : "rejected",
    verifiedByAdminId: adminId,
    rejectionReason: approved
      ? null
      : rejectionReason || "Verification rejected by admin",
  };

  saveRegisteredUsers(users);
  return { success: true };
}

export function updateUserInStorage(
  userId: string,
  updates: Partial<RegisteredUser>
): void {
  const users = getRegisteredUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveRegisteredUsers(users);
  }
}

// Notification functions
export function getNotifications(userId: string): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
    return allNotifications.filter((n) => n.userId === userId);
  } catch {
    return [];
  }
}

export function getAllNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addNotification(
  notification: Omit<Notification, "id" | "timestamp" | "read">
): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];

    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Error saving notification:", e);
  }
}

export function markNotificationRead(notificationId: string): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];

    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error marking notification as read:", e);
  }
}

export function markAllNotificationsRead(userId: string): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];

    const updated = notifications.map((n) =>
      n.userId === userId ? { ...n, read: true } : n
    );

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error marking notifications as read:", e);
  }
}

// Initialize default admin if none exists
export function initializeDefaultAdmin(): void {
  const users = getRegisteredUsers();
  const adminExists = users.some((u) => u.role === "admin");

  if (!adminExists) {
    const defaultAdmin: RegisteredUser = {
      id: "ADM-2024-SUPER",
      email: "admin@bondfi.com",
      password: "admin123",
      role: "admin",
      displayRole: "admin",
      name: "System Admin",
      createdAt: new Date().toISOString(),
      verificationStatus: "verified",
      verifiedByAdminId: null,
      rejectionReason: null,
    };

    users.push(defaultAdmin);
    saveRegisteredUsers(users);
  }
}

// Credit lister balance when investor purchases a bond
export function creditListerBalance(
  listerId: string,
  amount: number,
  bondName: string,
  investorId: string,
  tokenId: string
): { success: boolean; error?: string } {
  try {
    const userData = loadUserData(listerId);
    if (!userData) {
      // Initialize user data if not exists
      initializeUserData(listerId, "broker");
      const newUserData = loadUserData(listerId);
      if (!newUserData) {
        return { success: false, error: "Failed to initialize lister data" };
      }
      newUserData.listerBalance = amount;
      newUserData.availableForPayout = amount;

      // Add wallet transaction for lister
      newUserData.walletTransactions.push({
        id: `wtx-${Date.now()}`,
        type: "sale",
        amount: amount,
        description: `Sale: ${bondName} (Token: ${tokenId})`,
        timestamp: new Date().toISOString(),
        status: "completed",
        bondName: bondName,
      });

      saveUserData(listerId, newUserData);
      return { success: true };
    }

    // Update existing user data
    userData.listerBalance = (userData.listerBalance || 0) + amount;
    userData.availableForPayout = (userData.availableForPayout || 0) + amount;

    // Add wallet transaction for lister
    userData.walletTransactions.push({
      id: `wtx-${Date.now()}`,
      type: "sale",
      amount: amount,
      description: `Sale: ${bondName} (Token: ${tokenId})`,
      timestamp: new Date().toISOString(),
      status: "completed",
      bondName: bondName,
    });

    saveUserData(listerId, userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to credit lister balance" };
  }
}

// Generate unique token ID for bond purchase
export function generateTokenId(listerId: string, bondId: string): string {
  const listerSuffix = listerId.slice(-4).toUpperCase();
  const bondSuffix = bondId.slice(-4).toUpperCase();
  const timestamp = Date.now() % 10000;
  return `T${listerSuffix}${bondSuffix}${timestamp}`;
}

// ============================================
// ADMIN NOTIFICATION SYSTEM
// Notifications specifically for admin users
// ============================================

const ADMIN_NOTIFICATIONS_KEY = "bondfi_admin_notifications";

export interface AdminNotification {
  id: string;
  type:
    | "new_bond_request"
    | "oracle_update"
    | "new_user_request"
    | "bond_edit_request"
    | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  bondId?: string;
  userId?: string;
  oracleScore?: number;
}

/**
 * Get all admin notifications
 */
export function getAdminNotifications(): AdminNotification[] {
  try {
    const stored = localStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add a notification for admin
 * Used when:
 * - New bond listing request from lister
 * - Oracle score updated for a bond
 * - New user registration request
 * - Lister edit request
 */
export function addAdminNotification(
  notification: Omit<AdminNotification, "id" | "timestamp" | "read">
): void {
  try {
    const stored = localStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
    const notifications: AdminNotification[] = stored ? JSON.parse(stored) : [];

    const newNotification: AdminNotification = {
      ...notification,
      id: `admin-notif-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    notifications.push(newNotification);
    localStorage.setItem(
      ADMIN_NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );
  } catch (e) {
    console.error("Error saving admin notification:", e);
  }
}

/**
 * Mark a single admin notification as read
 */
export function markAdminNotificationRead(notificationId: string): void {
  try {
    const stored = localStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
    const notifications: AdminNotification[] = stored ? JSON.parse(stored) : [];

    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error marking admin notification as read:", e);
  }
}

/**
 * Mark all admin notifications as read
 */
export function markAllAdminNotificationsRead(): void {
  try {
    const stored = localStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
    const notifications: AdminNotification[] = stored ? JSON.parse(stored) : [];

    const updated = notifications.map((n) => ({ ...n, read: true }));

    localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error marking all admin notifications as read:", e);
  }
}

/**
 * Initialize demo admin notifications for testing
 * Called when admin logs in and no notifications exist
 */
export function initializeAdminDemoNotifications(): void {
  const existing = getAdminNotifications();
  if (existing.length === 0) {
    // Add some demo notifications for testing
    const demoNotifications: Omit<
      AdminNotification,
      "id" | "timestamp" | "read"
    >[] = [
      {
        type: "new_bond_request",
        title: "New Bond Request - G-Sec 10Y",
        message:
          "Issuer ABCDE1234F submitted a government bond listing with 8% yield. Pending your approval.",
        bondId: "demo-bond-001",
      },
      {
        type: "oracle_update",
        title: "Oracle Score Ready",
        message:
          "Bond #demo-bond-001 oracle compliance score: 85/100. Review and approve if score meets threshold.",
        bondId: "demo-bond-001",
        oracleScore: 85,
      },
      {
        type: "new_user_request",
        title: "New Lister Registration",
        message:
          "Alpha Securities (Broker) has registered and is pending KYC verification.",
        userId: "demo-user-001",
      },
    ];

    // Add with staggered timestamps
    demoNotifications.forEach((notif, index) => {
      setTimeout(() => {
        addAdminNotification(notif);
      }, index * 100);
    });
  }
}
