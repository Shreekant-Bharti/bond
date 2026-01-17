import { Bond, Investor, Broker, Custodian, FinancialInstitution, GovernmentPartner, Transaction, BondPurchase } from '@/types/bond';

// EIBS Demo - Exactly 4 Clean Bonds
export const initialBonds: Bond[] = [
  {
    id: 'bond-001',
    name: 'G-Sec Bond 8%',
    issuer: 'Reserve Bank of India',
    issuerPan: 'ABCDE1234F',
    yield: 8.0,
    tenure: 120,
    value: 50000,
    minInvestment: 1000,
    totalSupply: 500000000,
    availableSupply: 380000000,
    status: 'listed',
    approvalStatus: 'approved',
    createdAt: '2025-01-10',
    maturityDate: '2035-01-10',
    custodianId: 'custodian-001',
    description: 'Government Security Bond - 10 Year Maturity',
    oracleScore: 95,
    weillchainTx: '0xgs001abc123def456789',
  },
  {
    id: 'bond-002',
    name: 'Corporate AAA Bond',
    issuer: 'Tata Finance Ltd',
    issuerPan: 'PANDE1234F',
    yield: 9.2,
    tenure: 60,
    value: 25000,
    minInvestment: 500,
    totalSupply: 250000000,
    availableSupply: 180000000,
    status: 'listed',
    approvalStatus: 'approved',
    createdAt: '2025-01-12',
    maturityDate: '2030-01-12',
    custodianId: 'custodian-001',
    description: 'AAA Rated Corporate Bond',
    oracleScore: 92,
    weillchainTx: '0xcorp002xyz789abc123',
  },
  {
    id: 'bond-003',
    name: 'Municipal Bond',
    issuer: 'Mumbai Municipal Corp',
    issuerPan: 'TESTP1234A',
    yield: 7.5,
    tenure: 84,
    value: 10000,
    minInvestment: 500,
    totalSupply: 100000000,
    availableSupply: 100000000,
    status: 'available',
    approvalStatus: 'pending',
    createdAt: '2025-01-15',
    maturityDate: '2032-01-15',
    custodianId: 'custodian-001',
    description: 'Municipal Infrastructure Bond - Pending Approval',
    oracleScore: 88,
  },
  {
    id: 'bond-004',
    name: 'High Yield Bond',
    issuer: 'Unknown Corp',
    issuerPan: 'DUMMY12345',
    yield: 15.0,
    tenure: 24,
    value: 5000,
    minInvestment: 100,
    totalSupply: 50000000,
    availableSupply: 50000000,
    status: 'available',
    approvalStatus: 'rejected',
    createdAt: '2025-01-16',
    maturityDate: '2027-01-16',
    custodianId: 'custodian-001',
    description: 'High Risk Bond - Oracle Verification Failed',
    oracleScore: 25,
  },
];

export const initialInvestor: Investor = {
  id: 'investor-001',
  name: 'Demo Investor',
  email: 'investor@bondfi.demo',
  role: 'investor',
  balance: 200000, // 2000 AINR = ₹2,00,000
  totalInvested: 0,
  totalReturns: 0,
  createdAt: '2025-01-01',
  purchases: [],
};

export const initialBroker: Broker = {
  id: 'broker-001',
  name: 'BondFi Lister',
  email: 'lister@bondfi.demo',
  role: 'broker',
  createdAt: '2025-01-01',
  listedBonds: ['bond-001', 'bond-002'],
  totalListings: 2,
  transactionVolume: 500000, // 5000 USDT
};

export const initialCustodian: Custodian = {
  id: 'custodian-001',
  name: 'NSDL Custody',
  email: 'custodian@bondfi.demo',
  role: 'custodian',
  createdAt: '2025-01-01',
  bondsInCustody: ['bond-001', 'bond-002'],
  totalCustodyValue: 750000,
  settlementsProcessed: 2,
};

export const initialCustodian2: Custodian = {
  id: 'custodian-002',
  name: 'CDSL Custody',
  email: 'custody2@bondfi.demo',
  role: 'custodian',
  createdAt: '2025-01-01',
  bondsInCustody: [],
  totalCustodyValue: 0,
  settlementsProcessed: 0,
};

export const initialFinancialInstitution: FinancialInstitution = {
  id: 'fi-001',
  name: 'BondFi Issuer',
  email: 'fi@bondfi.demo',
  role: 'financial_institution',
  createdAt: '2025-01-01',
  issuedBonds: ['bond-001', 'bond-002', 'bond-003', 'bond-004'],
  totalIssuedValue: 900000,
  activeSupply: 560000000,
};

export const initialGovernmentPartner: GovernmentPartner = {
  id: 'gov-001',
  name: 'SEBI Oversight',
  email: 'gov@bondfi.demo',
  role: 'government_partner',
  createdAt: '2025-01-01',
  jurisdiction: 'India',
  oversightLevel: 'read-only',
};

// Empty transactions - Real-time only (no dummy history)
export const initialTransactions: Transaction[] = [];

export const yieldHistoryData = [
  { month: 'Jan', yield: 7.5, returns: 0 },
  { month: 'Feb', yield: 7.8, returns: 0 },
  { month: 'Mar', yield: 8.0, returns: 0 },
];

export const complianceMetrics = {
  totalBondsIssued: 4,
  totalValueIssued: 900000,
  totalInvestments: 0,
  activeInvestors: 1,
  settlementsToday: 0,
  pendingVerifications: 1,
  complianceScore: 100,
  auditsPassed: 0,
};
