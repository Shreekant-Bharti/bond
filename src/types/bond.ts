export type BondStatus = "available" | "listed" | "sold" | "matured";

export type ListerSubType =
  | "Broker"
  | "Custodian"
  | "Financial Institution"
  | "Government Partner";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface Bond {
  id: string;
  name: string;
  issuer: string;
  yield: number;
  tenure: number; // in months
  value: number;
  minInvestment: number;
  totalSupply: number;
  availableSupply: number;
  status: BondStatus;
  approvalStatus: ApprovalStatus; // Admin approval status
  approvedByAdminId?: string | null; // NEW: Admin who approved
  rejectionReason?: string | null; // NEW: Reason for rejection
  createdAt: string;
  maturityDate: string;
  custodianId: string;
  description: string;
  listerSubType?: ListerSubType;
  listerId?: string; // ID of the lister who created the bond
  /**
   * Oracle Compliance Score (0-100)
   * NOTE: Currently this is DEMO/MOCK data.
   * TODO: When RBI / official KYC / PAN / bond data APIs are integrated,
   * this field will be populated from real oracle sources.
   */
  oracleScore?: number;
}

export interface BondPurchase {
  id: string;
  bondId: string;
  investorId: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: string;
  expectedReturn: number;
  maturityDate: string;
  status: "active" | "matured" | "sold";
}

export interface Transaction {
  id: string;
  type: "purchase" | "sale" | "listing" | "issuance" | "settlement";
  bondId: string;
  fromId?: string;
  toId?: string;
  amount: number;
  value: number;
  timestamp: string;
  status: "pending" | "completed" | "failed";
  description: string;
  // NEW: For investor-lister transaction tracking
  listerId?: string;
  investorId?: string;
  tokenId?: string;
}

export type UserRole =
  | "investor"
  | "broker"
  | "custodian"
  | "financial_institution"
  | "government_partner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance?: number; // For investors - stablecoin balance
  createdAt: string;
}

export interface Investor extends User {
  role: "investor";
  balance: number;
  totalInvested: number;
  totalReturns: number;
  purchases: BondPurchase[];
  country?: string;
  preferredCurrency?: "INR" | "USDT";
}

export interface Broker extends User {
  role: "broker";
  listedBonds: string[];
  totalListings: number;
  transactionVolume: number;
}

export interface Custodian extends User {
  role: "custodian";
  bondsInCustody: string[];
  totalCustodyValue: number;
  settlementsProcessed: number;
}

export interface FinancialInstitution extends User {
  role: "financial_institution";
  issuedBonds: string[];
  totalIssuedValue: number;
  activeSupply: number;
}

export interface GovernmentPartner extends User {
  role: "government_partner";
  jurisdiction: string;
  oversightLevel: "read-only";
}

export type AdminRole = "admin";

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  read: boolean;
  timestamp: string;
  bondId?: string;
}

export interface DemoCredentials {
  email: string;
  password: string;
}

export const DEMO_CREDENTIALS: Record<UserRole, DemoCredentials> = {
  investor: { email: "investor@bondfi.demo", password: "demo123" },
  broker: { email: "broker@bondfi.demo", password: "demo123" },
  custodian: { email: "custodian@bondfi.demo", password: "demo123" },
  financial_institution: { email: "fi@bondfi.demo", password: "demo123" },
  government_partner: { email: "gov@bondfi.demo", password: "demo123" },
};
