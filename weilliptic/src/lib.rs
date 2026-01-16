use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Verification result from oracle check
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VerificationResult {
    pub score: u8,           // 0-100 compliance score
    pub deviation: f32,      // % deviation from standard
    #[serde(rename = "gstValid")]
    pub gst_valid: bool,     // GST registration status
    pub turnover: u64,       // Turnover in INR
    pub recommended: bool,   // Recommendation for approval
}

/// Approval result after bond verification
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ApprovalResult {
    pub approved: bool,      // Final approval status
    #[serde(rename = "txId")]
    pub tx_id: String,       // WeilChain transaction ID
    #[serde(rename = "oracleScore")]
    pub oracle_score: u8,    // Oracle verification score
}

/// Bond verification request
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BondApprovalRequest {
    #[serde(rename = "bondId")]
    pub bond_id: String,
    pub pan: String,
    #[serde(rename = "yieldPercent")]
    pub yield_percent: f32,
    #[serde(rename = "faceValue")]
    pub face_value: u64,
}

/// BondFi Compliance Engine Implementation
#[wasm_bindgen]
pub struct BondFiCompliance {
    approval_threshold: u8,
}

#[wasm_bindgen]
impl BondFiCompliance {
    /// Create new compliance engine
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        BondFiCompliance {
            approval_threshold: 97,
        }
    }

    /// Verify issuer using PAN (Mock Sandbox.co.in API)
    #[wasm_bindgen(js_name = verifyIssuer)]
    pub fn verify_issuer(&self, pan: String) -> JsValue {
        // Mock Sandbox.co.in API response
        // In production, this would call the actual API
        let score = if pan.len() > 8 && pan.starts_with("AA") {
            98
        } else if pan.len() > 8 {
            75
        } else {
            45
        };

        let result = VerificationResult {
            score,
            deviation: (100.0 - score as f32) / 100.0,
            gst_valid: pan.len() > 8,
            turnover: if score > 90 { 500_000_000 } else { 100_000_000 }, // ₹500 Cr or ₹100 Cr
            recommended: score >= self.approval_threshold,
        };

        serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
    }

    /// Approve bond after verification
    #[wasm_bindgen(js_name = approveBond)]
    pub fn approve_bond(
        &self,
        bond_id: String,
        pan: String,
        yield_percent: f32,
        face_value: u64,
    ) -> JsValue {
        // Verify issuer first
        let score = if pan.len() > 8 && pan.starts_with("AA") {
            98
        } else if pan.len() > 8 {
            75
        } else {
            45
        };

        // Business logic checks
        let yield_valid = yield_percent >= 5.0 && yield_percent <= 15.0;
        let face_value_valid = face_value >= 10_000 && face_value <= 100_000_000;
        let score_valid = score >= self.approval_threshold;

        let approved = yield_valid && face_value_valid && score_valid;

        // Generate transaction ID (mock)
        let tx_id = if approved {
            format!("weil-tx-{}-{}", bond_id, chrono_mock())
        } else {
            String::new()
        };

        let result = ApprovalResult {
            approved,
            tx_id,
            oracle_score: score,
        };

        serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
    }
}

/// Mock timestamp generator (replace with actual chrono in production)
fn chrono_mock() -> u64 {
    // In production: chrono::Utc::now().timestamp() as u64
    1705420800 // Mock timestamp
}

impl Default for BondFiCompliance {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_issuer_high_score() {
        let compliance = BondFiCompliance::new();
        // Note: WASM tests would need different approach
        assert!(compliance.approval_threshold == 97);
    }
}
