/**
 * BondFi Compliance Service
 * Integrates with WeilChain for oracle verification and bond approval
 */

import { 
  weilChainClient, 
  verifyIssuerOnWeilChain, 
  approveBondOnWeilChain,
  type VerificationResult,
  type ApprovalResult,
  type BondApprovalRequest
} from './weilchain';

export interface ComplianceCheckResult {
  isCompliant: boolean;
  oracleScore: number;
  deviation: number;
  gstStatus: 'valid' | 'invalid' | 'pending';
  turnoverINR: number;
  recommendation: 'approve' | 'reject' | 'manual_review';
  weilChainVerified: boolean;
  timestamp: Date;
}

export interface BondApprovalInput {
  bondId: string;
  issuerPAN: string;
  yieldPercent: number;
  faceValue: number;
  issuerName?: string;
  bondType?: string;
}

export interface BondApprovalOutput {
  approved: boolean;
  weilChainTxId: string;
  oracleScore: number;
  complianceDetails: ComplianceCheckResult;
  processedAt: Date;
}

/**
 * BondFi Compliance Engine
 * Replaces manual admin approval with WeilChain oracle verification
 */
class BondFiComplianceService {
  private initialized: boolean = false;

  /**
   * Initialize the compliance service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const connected = await weilChainClient.connect();
    if (!connected) {
      throw new Error('Failed to connect to WeilChain');
    }
    
    this.initialized = true;
    console.log('[BondFi Compliance] Service initialized');
  }

  /**
   * Perform compliance check on issuer
   */
  async checkCompliance(pan: string): Promise<ComplianceCheckResult> {
    await this.ensureInitialized();

    const verification = await verifyIssuerOnWeilChain(pan);

    return this.mapToComplianceResult(verification);
  }

  /**
   * Process bond approval through WeilChain
   */
  async processBondApproval(input: BondApprovalInput): Promise<BondApprovalOutput> {
    await this.ensureInitialized();

    // First, check compliance
    const complianceCheck = await this.checkCompliance(input.issuerPAN);

    // If not compliant, reject immediately
    if (!complianceCheck.isCompliant && complianceCheck.recommendation === 'reject') {
      return {
        approved: false,
        weilChainTxId: '',
        oracleScore: complianceCheck.oracleScore,
        complianceDetails: complianceCheck,
        processedAt: new Date(),
      };
    }

    // Process through WeilChain
    const request: BondApprovalRequest = {
      bondId: input.bondId,
      pan: input.issuerPAN,
      yieldPercent: input.yieldPercent,
      faceValue: input.faceValue,
    };

    const approval = await approveBondOnWeilChain(request);

    return {
      approved: approval.approved,
      weilChainTxId: approval.txId,
      oracleScore: approval.oracleScore,
      complianceDetails: complianceCheck,
      processedAt: new Date(),
    };
  }

  /**
   * Map WeilChain verification to compliance result
   */
  private mapToComplianceResult(verification: VerificationResult): ComplianceCheckResult {
    let recommendation: 'approve' | 'reject' | 'manual_review';
    
    if (verification.recommended && verification.score >= 97) {
      recommendation = 'approve';
    } else if (verification.score < 50) {
      recommendation = 'reject';
    } else {
      recommendation = 'manual_review';
    }

    return {
      isCompliant: verification.recommended,
      oracleScore: verification.score,
      deviation: verification.deviation,
      gstStatus: verification.gstValid ? 'valid' : 'invalid',
      turnoverINR: verification.turnover,
      recommendation,
      weilChainVerified: true,
      timestamp: new Date(),
    };
  }

  /**
   * Ensure service is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get service status
   */
  getStatus(): { initialized: boolean; connected: boolean } {
    return {
      initialized: this.initialized,
      connected: weilChainClient.isConnected(),
    };
  }
}

// Singleton export
export const bondFiCompliance = new BondFiComplianceService();

// Export types for external usage
export type { VerificationResult, ApprovalResult, BondApprovalRequest };

export default bondFiCompliance;
