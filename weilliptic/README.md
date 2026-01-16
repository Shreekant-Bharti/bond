# BondFi + WeilChain Integration

## Quick Start (Windows)

### Prerequisites
- Windows 10/11
- Node.js 18+ 
- Rust (installed via `winget install Rustlang.Rustup`)

### Setup Commands
```powershell
# Navigate to project
cd bond

# Install dependencies
npm install

# Start development server
npm run dev
```

### WeilChain Applet Setup
```powershell
# Navigate to weilliptic folder
cd weilliptic

# Add WASM target (one-time)
rustup target add wasm32-unknown-unknown

# Build WASM module
cargo build --target wasm32-unknown-unknown --release
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BondFi Frontend                       │
│                    (React + Vite)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐     ┌─────────────────────────────┐    │
│  │  useWeilChain │───▶│  bondfi-compliance.ts      │    │
│  │    Hook      │     │  (Service Layer)           │    │
│  └─────────────┘     └──────────────┬──────────────┘    │
│                                      │                   │
│                      ┌───────────────▼───────────────┐  │
│                      │       weilchain.ts            │  │
│                      │    (WeilChain SDK Client)     │  │
│                      └───────────────┬───────────────┘  │
│                                      │                   │
└──────────────────────────────────────┼──────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   WeilChain Sentinel        │
                        │   sentinel.weilliptic.ai    │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   BondFi Compliance Applet  │
                        │   (Rust WASM on WeilChain)  │
                        │                              │
                        │  ┌────────────────────────┐ │
                        │  │ verifyIssuer(pan)      │ │
                        │  │ approveBond(...)       │ │
                        │  └────────────────────────┘ │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Oracle Integration        │
                        │   (Sandbox.co.in Mock)     │
                        └─────────────────────────────┘
```

## Files Created

### Weilliptic Applet (`/weilliptic/`)
- `bondfi.widl` - WIDL interface definition
- `Cargo.toml` - Rust project configuration
- `src/lib.rs` - Rust smart contract implementation

### Frontend Integration (`/src/lib/`)
- `weilchain.ts` - WeilChain SDK client
- `bondfi-compliance.ts` - Compliance service layer

### React Hook (`/src/hooks/`)
- `useWeilChain.ts` - React hook for easy component integration

## Usage in Components

```tsx
import { useWeilChain } from '@/hooks/useWeilChain';

function BondApprovalComponent() {
  const { 
    isConnected, 
    isLoading, 
    checkCompliance, 
    approveBond,
    lastVerification 
  } = useWeilChain();

  const handleVerify = async (pan: string) => {
    const result = await checkCompliance(pan);
    if (result?.recommended) {
      console.log('Issuer verified! Score:', result.oracleScore);
    }
  };

  const handleApprove = async (bondData: BondApprovalInput) => {
    const result = await approveBond(bondData);
    if (result?.approved) {
      console.log('Bond approved! TX:', result.weilChainTxId);
    }
  };

  return (
    <div>
      <p>WeilChain Status: {isConnected ? '✅ Connected' : '⏳ Connecting...'}</p>
      {/* Your UI here */}
    </div>
  );
}
```

## API Reference

### `checkCompliance(pan: string)`
Verifies issuer through WeilChain oracle.

Returns:
```typescript
{
  isCompliant: boolean;
  oracleScore: number;      // 0-100
  deviation: number;        // % from standard
  gstStatus: 'valid' | 'invalid' | 'pending';
  turnoverINR: number;
  recommendation: 'approve' | 'reject' | 'manual_review';
  weilChainVerified: boolean;
  timestamp: Date;
}
```

### `approveBond(input: BondApprovalInput)`
Processes bond approval through WeilChain.

Input:
```typescript
{
  bondId: string;
  issuerPAN: string;
  yieldPercent: number;
  faceValue: number;
}
```

Returns:
```typescript
{
  approved: boolean;
  weilChainTxId: string;    // e.g., "weil-tx-BOND001-1705420800"
  oracleScore: number;
  complianceDetails: ComplianceCheckResult;
  processedAt: Date;
}
```

## Hackathon Demo Flow

1. User submits bond for approval
2. Frontend calls `useWeilChain().checkCompliance(pan)`
3. WeilChain oracle verifies issuer via Sandbox.co.in
4. If score >= 97, calls `approveBond(...)` 
5. WeilChain returns transaction ID
6. UI shows approval status with WeilChain TX link
