/**
 * WeilChain SDK for BondFi Integration
 * Handles communication with Weilliptic WeilChain applet
 */

export interface VerificationResult {
  score: number;        // 0-100 compliance score
  deviation: number;    // % deviation from standard
  gstValid: boolean;    // GST registration status
  turnover: number;     // Turnover in INR
  recommended: boolean; // Recommendation for approval
}

export interface ApprovalResult {
  approved: boolean;    // Final approval status
  txId: string;         // WeilChain transaction ID
  oracleScore: number;  // Oracle verification score
}

export interface BondApprovalRequest {
  bondId: string;
  pan: string;
  yieldPercent: number;
  faceValue: number;
}

// WeilChain Configuration
const WEILCHAIN_CONFIG = {
  sentinelUrl: 'https://sentinel.weilliptic.ai',
  appletId: 'bondfi-compliance',
  apiVersion: 'v1',
};

/**
 * WeilChain Client for BondFi Compliance
 */
class WeilChainClient {
  private sentinelUrl: string;
  private appletId: string;
  private connected: boolean = false;

  constructor(config: typeof WEILCHAIN_CONFIG) {
    this.sentinelUrl = config.sentinelUrl;
    this.appletId = config.appletId;
  }

  /**
   * Connect to WeilChain Sentinel
   */
  async connect(): Promise<boolean> {
    try {
      // In production: Actual WebSocket/HTTP connection to Sentinel
      console.log(`[WeilChain] Connecting to ${this.sentinelUrl}...`);
      
      // Mock connection for hackathon demo
      await this.simulateNetworkDelay(500);
      this.connected = true;
      console.log('[WeilChain] Connected successfully');
      return true;
    } catch (error) {
      console.error('[WeilChain] Connection failed:', error);
      return false;
    }
  }

  /**
   * Verify issuer using PAN via WeilChain Oracle
   */
  async verifyIssuer(pan: string): Promise<VerificationResult> {
    if (!this.connected) {
      await this.connect();
    }

    console.log(`[WeilChain] Verifying issuer: ${pan.substring(0, 4)}****`);
    
    // Simulate WeilChain oracle call
    await this.simulateNetworkDelay(1000);

    // Mock Sandbox.co.in API response via WeilChain
    const score = this.calculateComplianceScore(pan);
    
    const result: VerificationResult = {
      score,
      deviation: (100 - score) / 100,
      gstValid: pan.length > 8,
      turnover: score > 90 ? 500000000 : 100000000, // ₹500 Cr or ₹100 Cr
      recommended: score >= 97,
    };

    console.log('[WeilChain] Verification result:', result);
    return result;
  }

  /**
   * Approve bond via WeilChain mutate call
   */
  async approveBond(request: BondApprovalRequest): Promise<ApprovalResult> {
    if (!this.connected) {
      await this.connect();
    }

    console.log(`[WeilChain] Processing bond approval for: ${request.bondId}`);
    
    // Simulate WeilChain transaction
    await this.simulateNetworkDelay(1500);

    const score = this.calculateComplianceScore(request.pan);
    
    // Business logic checks
    const yieldValid = request.yieldPercent >= 5 && request.yieldPercent <= 15;
    const faceValueValid = request.faceValue >= 10000 && request.faceValue <= 100000000;
    const scoreValid = score >= 97;

    const approved = yieldValid && faceValueValid && scoreValid;

    const result: ApprovalResult = {
      approved,
      txId: approved ? `weil-tx-${request.bondId}-${Date.now()}` : '',
      oracleScore: score,
    };

    console.log('[WeilChain] Approval result:', result);
    return result;
  }

  /**
   * Calculate compliance score based on PAN
   */
  private calculateComplianceScore(pan: string): number {
    if (pan.length > 8 && pan.startsWith('AA')) {
      return 98;
    } else if (pan.length > 8) {
      return 75;
    }
    return 45;
  }

  /**
   * Simulate network delay for demo
   */
  private simulateNetworkDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from WeilChain
   */
  disconnect(): void {
    this.connected = false;
    console.log('[WeilChain] Disconnected');
  }
}

// Singleton instance
export const weilChainClient = new WeilChainClient(WEILCHAIN_CONFIG);

// Export functions for direct usage
export const verifyIssuerOnWeilChain = (pan: string) => 
  weilChainClient.verifyIssuer(pan);

export const approveBondOnWeilChain = (request: BondApprovalRequest) => 
  weilChainClient.approveBond(request);

export default weilChainClient;
