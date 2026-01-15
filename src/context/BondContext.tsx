import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Bond,
  Transaction,
  Investor,
  Broker,
  Custodian,
  FinancialInstitution,
  GovernmentPartner,
  UserRole,
  BondPurchase,
} from "@/types/bond";
import {
  initialBonds,
  initialInvestor,
  initialBroker,
  initialCustodian,
  initialFinancialInstitution,
  initialGovernmentPartner,
  initialTransactions,
  complianceMetrics as initialComplianceMetrics,
} from "@/data/dummyData";
import {
  RegisteredUser,
  getCurrentSession,
  setCurrentSession,
  clearCurrentSession,
  loadUserData,
  saveUserData,
  UserData,
  registerUser,
  authenticateUser,
  isDemoUser,
  creditListerBalance,
  generateTokenId,
} from "@/lib/userStorage";

interface ComplianceMetrics {
  totalBondsIssued: number;
  totalValueIssued: number;
  totalInvestments: number;
  activeInvestors: number;
  settlementsToday: number;
  pendingVerifications: number;
  complianceScore: number;
  auditsPassed: number;
}

export interface BondListing {
  id: string;
  bondId: string;
  minInvestmentUnit: number;
  availableQuantity: number;
  listingStartDate: string;
  listingEndDate: string;
  status: "active" | "expired" | "sold_out";
  createdAt: string;
}

export interface SecondaryMarketListing {
  id: string;
  purchaseId: string;
  bondId: string;
  sellerId: string;
  quantity: number;
  sellingPrice: number;
  originalPrice: number;
  yield: number;
  listedAt: string;
  status: "listed" | "sold" | "cancelled";
}

export interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "savings" | "current";
}

export interface WalletTransaction {
  id: string;
  type: "purchase" | "sale" | "topup" | "withdrawal";
  amount: number;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  bondName?: string;
}

interface BondContextType {
  // Data
  bonds: Bond[];
  transactions: Transaction[];
  investor: Investor;
  broker: Broker;
  custodian: Custodian;
  financialInstitution: FinancialInstitution;
  governmentPartner: GovernmentPartner;
  complianceMetrics: ComplianceMetrics;
  listings: BondListing[];
  secondaryMarketListings: SecondaryMarketListing[];
  bankAccount: BankAccount | null;
  walletTransactions: WalletTransaction[];
  availableForPayout: number;
  listerBalance: number;

  // Auth
  currentUser: RegisteredUser | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (
    email: string,
    password: string
  ) => { success: boolean; error?: string };
  registerNewUser: (userData: {
    email: string;
    password: string;
    role: UserRole;
    name?: string;
    country?: string;
    preferredCurrency?: "INR" | "USDT";
    orgName?: string;
  }) => { success: boolean; user?: RegisteredUser; error?: string };
  logout: () => void;

  // Investor Actions
  updateInvestorProfile: (
    updates: Partial<Pick<Investor, "name" | "country" | "preferredCurrency">>
  ) => void;
  addStablecoins: (amount: number) => void;

  // Actions
  purchaseBond: (
    bondId: string,
    amount: number
  ) => { success: boolean; error?: string };
  listBond: (
    bondId: string,
    config: {
      minInvestmentUnit: number;
      availableQuantity: number;
      listingStartDate: string;
      listingEndDate: string;
    }
  ) => { success: boolean; error?: string };
  createBond: (
    bond: Omit<Bond, "id" | "createdAt" | "status" | "approvalStatus">
  ) => string;
  approveBond: (
    bondId: string,
    approved: boolean
  ) => { success: boolean; error?: string };
  autoVerifyAndApproveBond: (bondId: string) => void;
  confirmSettlement: (transactionId: string) => void;

  // Secondary Market Actions
  listBondForSale: (
    purchaseId: string,
    quantity: number,
    sellingPrice: number
  ) => { success: boolean; error?: string };
  buyFromSecondaryMarket: (listingId: string) => {
    success: boolean;
    error?: string;
  };

  // Wallet Actions
  saveBankAccount: (account: Omit<BankAccount, "id">) => void;
  withdrawFunds: (
    amount: number
  ) => Promise<{ success: boolean; error?: string }>;

  // Helpers
  getBondById: (id: string) => Bond | undefined;
  getTransactionsByBond: (bondId: string) => Transaction[];
  hasOverlappingListing: (
    bondId: string,
    startDate: string,
    endDate: string
  ) => boolean;
  getApprovedBondsForInvestors: () => Bond[];
  getSecondaryMarketListingsForInvestors: () => SecondaryMarketListing[];
}

const BondContext = createContext<BondContextType | undefined>(undefined);

const SHARED_STORAGE_KEY = "bondfi_shared_data";

interface SharedData {
  bonds: Bond[];
  transactions: Transaction[];
  custodian: Custodian;
  financialInstitution: FinancialInstitution;
  governmentPartner: GovernmentPartner;
  complianceMetrics: ComplianceMetrics;
  // Global secondary market listings (from all users)
  globalSecondaryMarketListings: SecondaryMarketListing[];
}

function loadSharedData(): SharedData | null {
  try {
    const stored = localStorage.getItem(SHARED_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading shared data:", e);
  }
  return null;
}

function saveSharedData(data: SharedData): void {
  try {
    localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving shared data:", e);
  }
}

export function BondProvider({ children }: { children: ReactNode }) {
  const sharedStored = loadSharedData();
  const sessionUser = getCurrentSession();
  const userData = sessionUser ? loadUserData(sessionUser.id) : null;

  // Shared data (bonds, transactions, etc.)
  const [bonds, setBonds] = useState<Bond[]>(
    sharedStored?.bonds || initialBonds
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    sharedStored?.transactions || initialTransactions
  );
  const [custodian, setCustodian] = useState<Custodian>(
    sharedStored?.custodian || initialCustodian
  );
  const [financialInstitution, setFinancialInstitution] =
    useState<FinancialInstitution>(
      sharedStored?.financialInstitution || initialFinancialInstitution
    );
  const [governmentPartner, setGovernmentPartner] = useState<GovernmentPartner>(
    sharedStored?.governmentPartner || initialGovernmentPartner
  );
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics>(
    sharedStored?.complianceMetrics || initialComplianceMetrics
  );

  // Global secondary market listings (shared across all users)
  const [globalSecondaryMarketListings, setGlobalSecondaryMarketListings] =
    useState<SecondaryMarketListing[]>(
      sharedStored?.globalSecondaryMarketListings || []
    );

  // User-specific data
  const [investor, setInvestor] = useState<Investor>(
    userData?.investor || initialInvestor
  );
  const [broker, setBroker] = useState<Broker>(
    userData?.broker || initialBroker
  );
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >(userData?.walletTransactions || []);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(
    userData?.bankAccount || null
  );
  const [availableForPayout, setAvailableForPayout] = useState<number>(
    userData?.availableForPayout || 0
  );
  const [listerBalance, setListerBalance] = useState<number>(
    userData?.listerBalance || 0
  );
  const [listings, setListings] = useState<BondListing[]>(
    userData?.listings || []
  );

  // For backward compatibility - secondaryMarketListings now points to global
  const secondaryMarketListings = globalSecondaryMarketListings;
  const setSecondaryMarketListings = setGlobalSecondaryMarketListings;

  // Current user session
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(
    sessionUser
  );

  // Persist shared data whenever it changes
  useEffect(() => {
    saveSharedData({
      bonds,
      transactions,
      custodian,
      financialInstitution,
      governmentPartner,
      complianceMetrics,
      globalSecondaryMarketListings,
    });
  }, [
    bonds,
    transactions,
    custodian,
    financialInstitution,
    governmentPartner,
    complianceMetrics,
    globalSecondaryMarketListings,
  ]);

  // Persist user-specific data whenever it changes (only if logged in)
  useEffect(() => {
    if (currentUser) {
      saveUserData(currentUser.id, {
        investor,
        broker,
        walletTransactions,
        bankAccount,
        availableForPayout,
        listerBalance,
        secondaryMarketListings: [], // Keep empty since we use global
        listings,
      });
    }
  }, [
    currentUser,
    investor,
    broker,
    walletTransactions,
    bankAccount,
    availableForPayout,
    listerBalance,
    listings,
  ]);

  // Demo login (for backward compatibility)
  const login = (role: UserRole) => {
    const demoUser: RegisteredUser = {
      id: role === "investor" ? "investor-001" : "broker-001",
      email: `${role}@bondfi.demo`,
      password: "demo123",
      role,
      displayRole: role === "investor" ? "investor" : "lister",
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(demoUser);
    setCurrentSession(demoUser);

    // Load demo data - try to load from storage first
    const demoUserData = loadUserData(demoUser.id);
    if (demoUserData) {
      setInvestor(demoUserData.investor);
      setBroker(demoUserData.broker);
      setWalletTransactions(demoUserData.walletTransactions);
      setBankAccount(demoUserData.bankAccount);
      setAvailableForPayout(demoUserData.availableForPayout);
      setListerBalance(demoUserData.listerBalance || 0);
      setListings(demoUserData.listings);
    } else {
      setInvestor(initialInvestor);
      setBroker(initialBroker);
      setWalletTransactions([]);
      setBankAccount(null);
      setAvailableForPayout(0);
      setListerBalance(0);
      setListings([]);
    }
  };

  // Login with credentials
  const loginWithCredentials = (
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    // Check if demo credentials
    if (isDemoUser(email)) {
      const role = email.includes("investor") ? "investor" : "broker";
      login(role as UserRole);
      return { success: true };
    }

    const result = authenticateUser(email, password);

    if (!result.success || !result.user) {
      return { success: false, error: result.error };
    }

    const user = result.user;

    // Check verification status before allowing login
    if (user.verificationStatus === "pending") {
      return { success: false, error: "Account pending admin verification" };
    }

    if (user.verificationStatus === "rejected") {
      return { success: false, error: "Account verification was rejected" };
    }

    setCurrentUser(user);
    setCurrentSession(user);

    // Load user-specific data
    const userData = loadUserData(user.id);
    if (userData) {
      setInvestor(userData.investor);
      setBroker(userData.broker);
      setWalletTransactions(userData.walletTransactions);
      setBankAccount(userData.bankAccount);
      setAvailableForPayout(userData.availableForPayout);
      setListerBalance(userData.listerBalance || 0);
      setListings(userData.listings);
    }

    return { success: true };
  };

  // Register new user
  const registerNewUser = (userData: {
    email: string;
    password: string;
    role: UserRole;
    name?: string;
    country?: string;
    preferredCurrency?: "INR" | "USDT";
    orgName?: string;
  }): { success: boolean; user?: RegisteredUser; error?: string } => {
    const result = registerUser({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      displayRole: userData.role === "investor" ? "investor" : "lister",
      name: userData.name,
      country: userData.country,
      preferredCurrency: userData.preferredCurrency,
      orgName: userData.orgName,
    });

    if (!result.success || !result.user) {
      return { success: false, error: result.error };
    }

    const user = result.user;

    // DO NOT set as current user - users need admin verification first
    // setCurrentUser(user);
    // setCurrentSession(user);

    // Initialize with fresh empty data (stored for when they get verified)
    const emptyInvestor: Investor = {
      id: user.id,
      name: userData.name || "New User",
      email: userData.email,
      role: "investor",
      balance: 0,
      totalInvested: 0,
      totalReturns: 0,
      purchases: [],
      createdAt: user.createdAt,
      country: userData.country,
      preferredCurrency: userData.preferredCurrency || "USDT",
    };

    const emptyBroker: Broker = {
      id: user.id,
      name: userData.name || userData.orgName || "New Lister",
      email: userData.email,
      role: "broker",
      listedBonds: [],
      totalListings: 0,
      transactionVolume: 0,
      createdAt: user.createdAt,
    };

    // Save user data directly to storage (for when they get verified)
    saveUserData(user.id, {
      investor: emptyInvestor,
      broker: emptyBroker,
      walletTransactions: [],
      bankAccount: null,
      availableForPayout: 0,
      listerBalance: 0,
      secondaryMarketListings: [],
      listings: [],
    });

    return { success: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
    clearCurrentSession();

    // Reset to initial state (don't clear localStorage - data persists)
    setInvestor(initialInvestor);
    setBroker(initialBroker);
    setWalletTransactions([]);
    setBankAccount(null);
    setAvailableForPayout(0);
    setListerBalance(0);
    setListings([]);
  };

  const updateInvestorProfile = (
    updates: Partial<Pick<Investor, "name" | "country" | "preferredCurrency">>
  ) => {
    setInvestor((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const addStablecoins = (amount: number) => {
    setInvestor((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));

    const newWalletTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      type: "topup",
      amount,
      description: `Purchased ${amount} USDT stablecoins`,
      timestamp: new Date().toISOString(),
      status: "completed",
    };
    setWalletTransactions((prev) => [...prev, newWalletTx]);

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: "purchase",
      bondId: "stablecoin",
      fromId: "external",
      toId: investor.id,
      amount,
      value: amount,
      timestamp: new Date().toISOString(),
      status: "completed",
      description: `Purchased ${amount} USDT stablecoins`,
    };

    setTransactions((prev) => [...prev, newTransaction]);
  };

  const purchaseBond = (
    bondId: string,
    amount: number
  ): { success: boolean; error?: string } => {
    const bond = bonds.find((b) => b.id === bondId);
    if (!bond) {
      return { success: false, error: "Bond not found" };
    }

    if (bond.availableSupply < amount) {
      return { success: false, error: "Insufficient bond supply" };
    }

    if (bond.approvalStatus !== "approved") {
      return { success: false, error: "Bond is not approved for investment" };
    }

    const purchaseValue = Math.max(1, bond.minInvestment) * amount;

    if (purchaseValue < 1) {
      return { success: false, error: "Minimum investment is $1" };
    }

    if (investor.balance < purchaseValue) {
      return { success: false, error: "Insufficient balance" };
    }

    const expectedReturn = (purchaseValue * bond.yield) / 100;

    // Get lister ID from bond (or fallback to broker)
    const listerId = bond.listerId || broker.id;

    // Generate unique token ID
    const tokenId = generateTokenId(listerId, bondId);

    const newPurchase: BondPurchase = {
      id: `purchase-${Date.now()}`,
      bondId,
      investorId: investor.id,
      amount,
      purchasePrice: purchaseValue,
      purchaseDate: new Date().toISOString().split("T")[0],
      expectedReturn,
      maturityDate: bond.maturityDate,
      status: "active",
    };

    // 1. Deduct from investor
    setInvestor((prev) => ({
      ...prev,
      balance: prev.balance - purchaseValue,
      totalInvested: prev.totalInvested + purchaseValue,
      purchases: [...prev.purchases, newPurchase],
    }));

    // 2. Credit lister balance (in localStorage for cross-user sync)
    creditListerBalance(
      listerId,
      purchaseValue,
      bond.name,
      investor.id,
      tokenId
    );

    // 3. Update bond supply
    setBonds((prev) =>
      prev.map((b) =>
        b.id === bondId
          ? { ...b, availableSupply: b.availableSupply - amount }
          : b
      )
    );

    // 4. Investor wallet transaction
    const newWalletTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      type: "purchase",
      amount: purchaseValue,
      description: `Purchased ${amount} units of ${bond.name} (Token: ${tokenId})`,
      timestamp: new Date().toISOString(),
      status: "completed",
      bondName: bond.name,
    };
    setWalletTransactions((prev) => [...prev, newWalletTx]);

    // 5. Main transaction record with lister/investor/token tracking
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: "purchase",
      bondId,
      fromId: investor.id,
      toId: listerId,
      amount,
      value: purchaseValue,
      timestamp: new Date().toISOString(),
      status: "completed",
      description: `Purchased ${amount} units of ${bond.name}`,
      // NEW: Track lister, investor, and token for history
      listerId: listerId,
      investorId: investor.id,
      tokenId: tokenId,
    };

    setTransactions((prev) => [...prev, newTransaction]);

    setComplianceMetrics((prev) => ({
      ...prev,
      totalInvestments: prev.totalInvestments + purchaseValue,
      settlementsToday: prev.settlementsToday + 1,
    }));

    setBroker((prev) => ({
      ...prev,
      transactionVolume: prev.transactionVolume + purchaseValue,
    }));

    return { success: true };
  };

  const hasOverlappingListing = (
    bondId: string,
    startDate: string,
    endDate: string
  ): boolean => {
    return listings.some((listing) => {
      if (listing.bondId !== bondId || listing.status !== "active")
        return false;
      const existingStart = new Date(listing.listingStartDate);
      const existingEnd = new Date(listing.listingEndDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  };

  const listBond = (
    bondId: string,
    config: {
      minInvestmentUnit: number;
      availableQuantity: number;
      listingStartDate: string;
      listingEndDate: string;
    }
  ): { success: boolean; error?: string } => {
    if (
      hasOverlappingListing(
        bondId,
        config.listingStartDate,
        config.listingEndDate
      )
    ) {
      return {
        success: false,
        error: "This bond already has an active listing with overlapping dates",
      };
    }

    const bond = bonds.find((b) => b.id === bondId);
    if (!bond) {
      return { success: false, error: "Bond not found" };
    }

    if (bond.approvalStatus !== "approved") {
      return {
        success: false,
        error:
          "Bond must be approved before listing. Please wait for admin approval.",
      };
    }

    const newListing: BondListing = {
      id: `listing-${Date.now()}`,
      bondId,
      minInvestmentUnit: config.minInvestmentUnit,
      availableQuantity: config.availableQuantity,
      listingStartDate: config.listingStartDate,
      listingEndDate: config.listingEndDate,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setListings((prev) => [...prev, newListing]);

    setBonds((prev) =>
      prev.map((b) =>
        b.id === bondId ? { ...b, status: "listed" as const } : b
      )
    );

    setBroker((prev) => ({
      ...prev,
      listedBonds: prev.listedBonds.includes(bondId)
        ? prev.listedBonds
        : [...prev.listedBonds, bondId],
      totalListings: prev.totalListings + 1,
    }));

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: "listing",
      bondId,
      fromId: financialInstitution.id,
      toId: broker.id,
      amount: config.availableQuantity,
      value: bond.value,
      timestamp: new Date().toISOString(),
      status: "completed",
      description: `Listed ${bond.name} for investor purchase`,
    };
    setTransactions((prev) => [...prev, newTransaction]);

    return { success: true };
  };

  const createBond = (
    bondData: Omit<Bond, "id" | "createdAt" | "status" | "approvalStatus">
  ): string => {
    const newBondId = `bond-${Date.now()}`;
    const newBond: Bond = {
      ...bondData,
      id: newBondId,
      createdAt: new Date().toISOString().split("T")[0],
      status: "available",
      approvalStatus: "pending",
      minInvestment: 1,
      listerId: currentUser?.id || broker.id,
    };

    setBonds((prev) => [...prev, newBond]);

    setBroker((prev) => ({
      ...prev,
      totalListings: prev.totalListings + 1,
    }));

    setCustodian((prev) => ({
      ...prev,
      bondsInCustody: [...prev.bondsInCustody, newBond.id],
      totalCustodyValue:
        prev.totalCustodyValue + bondData.value * bondData.totalSupply,
    }));

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: "issuance",
      bondId: newBond.id,
      fromId: currentUser?.id || broker.id,
      amount: bondData.totalSupply,
      value: bondData.value * bondData.totalSupply,
      timestamp: new Date().toISOString(),
      status: "pending",
      description: `Broker created new bond: ${bondData.name} (Pending Approval)`,
    };

    setTransactions((prev) => [...prev, newTransaction]);

    setComplianceMetrics((prev) => ({
      ...prev,
      totalBondsIssued: prev.totalBondsIssued + 1,
      totalValueIssued:
        prev.totalValueIssued + bondData.value * bondData.totalSupply,
      pendingVerifications: prev.pendingVerifications + 1,
    }));

    return newBondId;
  };

  const confirmSettlement = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, status: "completed" as const } : t
      )
    );

    setCustodian((prev) => ({
      ...prev,
      settlementsProcessed: prev.settlementsProcessed + 1,
    }));
  };

  const listBondForSale = (
    purchaseId: string,
    quantity: number,
    sellingPrice: number
  ): { success: boolean; error?: string } => {
    const purchase = investor.purchases.find((p) => p.id === purchaseId);
    if (!purchase) {
      return { success: false, error: "Purchase not found" };
    }

    if (quantity > purchase.amount) {
      return { success: false, error: "Cannot sell more than owned quantity" };
    }

    const bond = bonds.find((b) => b.id === purchase.bondId);
    if (!bond) {
      return { success: false, error: "Bond not found" };
    }

    const existingListing = secondaryMarketListings.find(
      (l) => l.purchaseId === purchaseId && l.status === "listed"
    );
    if (existingListing) {
      return { success: false, error: "This bond is already listed for sale" };
    }

    const newListing: SecondaryMarketListing = {
      id: `sm-${Date.now()}`,
      purchaseId,
      bondId: purchase.bondId,
      sellerId: currentUser?.id || investor.id,
      quantity,
      sellingPrice,
      originalPrice: purchase.purchasePrice,
      yield: bond.yield,
      listedAt: new Date().toISOString(),
      status: "listed",
    };

    setSecondaryMarketListings((prev) => [...prev, newListing]);

    setInvestor((prev) => ({
      ...prev,
      purchases: prev.purchases.map((p) =>
        p.id === purchaseId ? { ...p, status: "sold" as const } : p
      ),
    }));

    return { success: true };
  };

  const buyFromSecondaryMarket = (
    listingId: string
  ): { success: boolean; error?: string } => {
    const listing = secondaryMarketListings.find((l) => l.id === listingId);
    if (!listing || listing.status !== "listed") {
      return {
        success: false,
        error: "Listing not found or no longer available",
      };
    }

    // Prevent buying own listing
    if (listing.sellerId === (currentUser?.id || investor.id)) {
      return { success: false, error: "Cannot buy your own listing" };
    }

    if (investor.balance < listing.sellingPrice) {
      return { success: false, error: "Insufficient balance" };
    }

    const bond = bonds.find((b) => b.id === listing.bondId);
    if (!bond) {
      return { success: false, error: "Bond not found" };
    }

    // IMMEDIATELY remove the listing from secondary market
    setSecondaryMarketListings((prev) =>
      prev.filter((l) => l.id !== listingId)
    );

    // Deduct from buyer's balance and add purchase
    setInvestor((prev) => ({
      ...prev,
      balance: prev.balance - listing.sellingPrice,
      totalInvested: prev.totalInvested + listing.sellingPrice,
      purchases: [
        ...prev.purchases,
        {
          id: `purchase-${Date.now()}`,
          bondId: listing.bondId,
          investorId: currentUser?.id || investor.id,
          amount: listing.quantity,
          purchasePrice: listing.sellingPrice,
          purchaseDate: new Date().toISOString().split("T")[0],
          expectedReturn: (listing.sellingPrice * listing.yield) / 100,
          maturityDate: bond.maturityDate,
          status: "active",
        },
      ],
    }));

    // Credit seller's payout balance (simulating other investor)
    setAvailableForPayout((prev) => prev + listing.sellingPrice);

    // Determine if this was an early sale (before maturity)
    const maturityDate = new Date(bond.maturityDate);
    const now = new Date();
    const isEarlySale = now < maturityDate;
    const discountApplied = listing.originalPrice - listing.sellingPrice;

    const saleWalletTx: WalletTransaction = {
      id: `wtx-sale-${Date.now()}`,
      type: "sale",
      amount: listing.sellingPrice,
      description: isEarlySale
        ? `Sold ${listing.quantity} units of ${
            bond.name
          } (early sale, discount: $${discountApplied.toFixed(2)})`
        : `Sold ${listing.quantity} units of ${bond.name} on secondary market`,
      timestamp: new Date().toISOString(),
      status: "completed",
      bondName: bond.name,
    };

    const buyWalletTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      type: "purchase",
      amount: listing.sellingPrice,
      description: `Bought ${listing.quantity} units of ${bond.name} from secondary market`,
      timestamp: new Date().toISOString(),
      status: "completed",
      bondName: bond.name,
    };
    setWalletTransactions((prev) => [...prev, buyWalletTx, saleWalletTx]);

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: "sale",
      bondId: listing.bondId,
      fromId: listing.sellerId,
      toId: currentUser?.id || investor.id,
      amount: listing.quantity,
      value: listing.sellingPrice,
      timestamp: new Date().toISOString(),
      status: "completed",
      description: `Secondary market purchase: ${listing.quantity} units of ${bond.name}`,
    };
    setTransactions((prev) => [...prev, newTransaction]);

    return { success: true };
  };

  const saveBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount: BankAccount = {
      ...account,
      id: `bank-${Date.now()}`,
    };
    setBankAccount(newAccount);
  };

  const withdrawFunds = async (
    amount: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (amount > availableForPayout) {
      return { success: false, error: "Insufficient payout balance" };
    }

    if (!bankAccount) {
      return { success: false, error: "No bank account linked" };
    }

    await new Promise((resolve) => setTimeout(resolve, 8000));

    setAvailableForPayout((prev) => prev - amount);

    const withdrawalTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      type: "withdrawal",
      amount,
      description: `Withdrawal to ${
        bankAccount.bankName
      } - ****${bankAccount.accountNumber.slice(-4)}`,
      timestamp: new Date().toISOString(),
      status: "completed",
    };
    setWalletTransactions((prev) => [...prev, withdrawalTx]);

    return { success: true };
  };

  const getBondById = (id: string) => bonds.find((b) => b.id === id);
  const getTransactionsByBond = (bondId: string) =>
    transactions.filter((t) => t.bondId === bondId);

  const getApprovedBondsForInvestors = () =>
    bonds.filter(
      (b) => b.status === "listed" && b.approvalStatus === "approved"
    );

  // Get ALL listed (not sold) secondary market listings for investors
  // Include seller's own listings (they will see "Your Listing" label)
  // Filter out: sold listings and listings for non-approved bonds
  const getSecondaryMarketListingsForInvestors = () =>
    secondaryMarketListings.filter((l) => {
      if (l.status !== "listed") return false;
      // DO NOT filter by sellerId - sellers should see their own listings
      const bond = bonds.find((b) => b.id === l.bondId);
      if (!bond || bond.approvalStatus !== "approved") return false;
      return true;
    });

  const approveBond = (
    bondId: string,
    approved: boolean
  ): { success: boolean; error?: string } => {
    const bond = bonds.find((b) => b.id === bondId);
    if (!bond) {
      return { success: false, error: "Bond not found" };
    }

    setBonds((prev) =>
      prev.map((b) =>
        b.id === bondId
          ? {
              ...b,
              approvalStatus: approved
                ? ("approved" as const)
                : ("rejected" as const),
              // When approved, also set status to "listed" so it appears in investor market
              ...(approved && { status: "listed" as const }),
            }
          : b
      )
    );

    setComplianceMetrics((prev) => ({
      ...prev,
      pendingVerifications: Math.max(0, prev.pendingVerifications - 1),
    }));

    if (approved) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.bondId === bondId && t.status === "pending"
            ? {
                ...t,
                status: "completed" as const,
                description: t.description.replace(
                  "(Pending Approval)",
                  "(Approved)"
                ),
              }
            : t
        )
      );
    }

    return { success: true };
  };

  const autoVerifyAndApproveBond = (bondId: string) => {
    setBonds((prev) =>
      prev.map((b) =>
        b.id === bondId ? { ...b, approvalStatus: "pending" as const } : b
      )
    );

    setTimeout(() => {
      setBonds((prev) =>
        prev.map((b) =>
          b.id === bondId
            ? {
                ...b,
                approvalStatus: "approved" as const,
                status: "listed" as const,
              }
            : b
        )
      );

      setComplianceMetrics((prev) => ({
        ...prev,
        pendingVerifications: Math.max(0, prev.pendingVerifications - 1),
      }));

      setTransactions((prev) =>
        prev.map((t) =>
          t.bondId === bondId && t.status === "pending"
            ? {
                ...t,
                status: "completed" as const,
                description: t.description.replace(
                  "(Pending Approval)",
                  "(Approved)"
                ),
              }
            : t
        )
      );
    }, 10000);
  };

  return (
    <BondContext.Provider
      value={{
        bonds,
        transactions,
        investor,
        broker,
        custodian,
        financialInstitution,
        governmentPartner,
        complianceMetrics,
        listings,
        secondaryMarketListings,
        bankAccount,
        walletTransactions,
        availableForPayout,
        listerBalance,
        currentUser,
        login,
        loginWithCredentials,
        registerNewUser,
        logout,
        updateInvestorProfile,
        addStablecoins,
        purchaseBond,
        listBond,
        createBond,
        approveBond,
        autoVerifyAndApproveBond,
        confirmSettlement,
        listBondForSale,
        buyFromSecondaryMarket,
        saveBankAccount,
        withdrawFunds,
        getBondById,
        getTransactionsByBond,
        hasOverlappingListing,
        getApprovedBondsForInvestors,
        getSecondaryMarketListingsForInvestors,
      }}
    >
      {children}
    </BondContext.Provider>
  );
}

export function useBondContext() {
  const context = useContext(BondContext);
  if (context === undefined) {
    throw new Error("useBondContext must be used within a BondProvider");
  }
  return context;
}
