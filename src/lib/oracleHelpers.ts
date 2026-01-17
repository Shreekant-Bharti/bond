/**
 * Unified Oracle Status Helpers
 * Used by both Lister and Admin dashboards for consistent oracle status display
 * 
 * EIBS Hackathon - BondFi Oracle Sync
 */

import { Bond } from '@/types/bond';

export interface OracleStatus {
  status: 'verified' | 'pending' | 'flagged';
  label: string;
  color: 'green' | 'yellow' | 'red';
  score: number;
  reason?: string;
}

// Valid demo PAN numbers (for EIBS demo)
const VALID_DEMO_PANS = ['ABCDE1234F', 'PANDE1234F', 'TESTP1234A'];

// Reference yield for comparison (RBI G-Sec 10Y baseline)
const REFERENCE_YIELD = 7.5;
const YIELD_TOLERANCE = 4.5; // 12% max (7.5 + 4.5)

/**
 * Validate PAN format and demo validity
 * Format: AAAAA0000A (5 letters, 4 digits, 1 letter)
 */
export function isValidPan(pan?: string): boolean {
  if (!pan) return false;
  const panUpper = pan.toUpperCase().trim();
  
  // Check format
  const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
  if (!panRegex.test(panUpper)) return false;
  
  // For demo: check if it's one of our valid demo PANs
  return VALID_DEMO_PANS.includes(panUpper);
}

/**
 * Check if yield is within acceptable range
 * Flagged if yield > 12% (reference 7.5% + tolerance 4.5%)
 */
export function isYieldFlagged(yieldPercent: number): boolean {
  return yieldPercent > REFERENCE_YIELD + YIELD_TOLERANCE;
}

/**
 * Calculate oracle score based on PAN validity and yield
 * This provides consistent scoring across all dashboards
 */
export function calculateOracleScore(bond: Partial<Bond>): number {
  // If bond already has a stored oracleScore, use it
  if (bond.oracleScore !== undefined && bond.oracleScore > 0) {
    return bond.oracleScore;
  }
  
  let score = 100;
  
  // PAN validation (-40 if invalid)
  if (!isValidPan(bond.issuerPan)) {
    score -= 40;
  }
  
  // Yield validation (-35 if flagged, -15 if borderline)
  const yieldPercent = bond.yield || 0;
  if (yieldPercent > 12) {
    score -= 35; // High risk yield
  } else if (yieldPercent > 10) {
    score -= 15; // Borderline yield
  }
  
  // Issuer validation (-10 if unknown)
  if (!bond.issuer || bond.issuer.toLowerCase().includes('unknown')) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Get unified oracle status for a bond
 * Used by BOTH Lister and Admin dashboards
 * 
 * Rules:
 * - score >= 85 → "Verified ✅" (green)
 * - score 30-84 → "Pending Review ⚠️" (yellow)  
 * - score < 30 → "Rate Flagged ❌" (red)
 * - Also flagged if: yield > 12% OR invalid PAN
 */
export function getOracleStatus(bond: Partial<Bond>): OracleStatus {
  const score = calculateOracleScore(bond);
  const isRateFlagged = isYieldFlagged(bond.yield || 0);
  const isPanInvalid = !isValidPan(bond.issuerPan);
  
  // Rate Flagged (red) - High risk indicators
  if (isRateFlagged || isPanInvalid || score < 30) {
    let reason = '';
    if (isRateFlagged) reason = 'Yield exceeds 12% threshold';
    else if (isPanInvalid) reason = 'Invalid or unverified PAN';
    else reason = 'Low compliance score';
    
    return {
      status: 'flagged',
      label: 'Rate Flagged ❌',
      color: 'red',
      score,
      reason,
    };
  }
  
  // Verified (green) - High confidence
  if (score >= 85) {
    return {
      status: 'verified',
      label: 'Verified ✅',
      color: 'green',
      score,
    };
  }
  
  // Pending Review (yellow) - Needs attention
  return {
    status: 'pending',
    label: 'Pending Review ⚠️',
    color: 'yellow',
    score,
    reason: 'Manual review recommended',
  };
}

/**
 * Get CSS classes for oracle status badge
 */
export function getOracleStatusClasses(status: OracleStatus): string {
  switch (status.color) {
    case 'green':
      return 'bg-success/20 text-success border-success/30';
    case 'yellow':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'red':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    default:
      return 'bg-muted/20 text-muted-foreground border-border';
  }
}

/**
 * Check if bond can be approved based on oracle status
 * Only verified or pending (with admin override) can be approved
 */
export function canApproveBond(bond: Partial<Bond>): boolean {
  const status = getOracleStatus(bond);
  return status.status !== 'flagged' && status.score >= 50;
}
