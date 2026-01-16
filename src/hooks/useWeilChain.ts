/**
 * React Hook for WeilChain Integration
 * Provides easy access to BondFi compliance verification in React components
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  bondFiCompliance, 
  type ComplianceCheckResult, 
  type BondApprovalOutput,
  type BondApprovalInput 
} from '../lib/bondfi-compliance';

interface UseWeilChainState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastVerification: ComplianceCheckResult | null;
  lastApproval: BondApprovalOutput | null;
}

interface UseWeilChainReturn extends UseWeilChainState {
  checkCompliance: (pan: string) => Promise<ComplianceCheckResult | null>;
  approveBond: (input: BondApprovalInput) => Promise<BondApprovalOutput | null>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook for WeilChain compliance operations
 */
export function useWeilChain(): UseWeilChainReturn {
  const [state, setState] = useState<UseWeilChainState>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastVerification: null,
    lastApproval: null,
  });

  // Initialize connection on mount
  useEffect(() => {
    const init = async () => {
      try {
        await bondFiCompliance.initialize();
        setState(prev => ({ ...prev, isConnected: true }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to connect to WeilChain',
          isConnected: false 
        }));
      }
    };
    init();
  }, []);

  // Check compliance for an issuer
  const checkCompliance = useCallback(async (pan: string): Promise<ComplianceCheckResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await bondFiCompliance.checkCompliance(pan);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastVerification: result,
        isConnected: true
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, []);

  // Approve bond through WeilChain
  const approveBond = useCallback(async (input: BondApprovalInput): Promise<BondApprovalOutput | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await bondFiCompliance.processBondApproval(input);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastApproval: result,
        lastVerification: result.complianceDetails,
        isConnected: true
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Approval failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      lastVerification: null,
      lastApproval: null,
    }));
  }, []);

  return {
    ...state,
    checkCompliance,
    approveBond,
    clearError,
    reset,
  };
}

export default useWeilChain;
