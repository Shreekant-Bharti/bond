// Bond Fair Market Value Pricing Calculations

export interface BondPricingInput {
  faceValue: number;        // Principal / Face value of the bond
  couponRate: number;       // Annual yield as percentage (e.g., 7.5 for 7.5%)
  purchaseDate: string;     // Date of purchase (YYYY-MM-DD)
  maturityDate: string;     // Date of maturity (YYYY-MM-DD)
  marketRate?: number;      // Current market interest rate (defaults to coupon rate + 1%)
}

export interface BondPricingResult {
  fairMarketValue: number;           // Calculated fair price for early sale
  originalValue: number;             // Original purchase price
  discountAmount: number;            // Amount deducted
  discountPercentage: number;        // Discount as percentage
  remainingPeriods: number;          // Remaining coupon periods
  forfeitedInterest: number;         // Interest that would be forfeited
  isBeforeMaturity: boolean;         // Whether sale is before maturity
  daysUntilMaturity: number;         // Days remaining
}

/**
 * Calculate remaining periods until maturity
 * Assumes semi-annual coupon payments (2 periods per year)
 */
function calculateRemainingPeriods(maturityDate: string): number {
  const now = new Date();
  const maturity = new Date(maturityDate);
  const daysRemaining = Math.max(0, (maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Convert to semi-annual periods (6 months each)
  const periodsRemaining = daysRemaining / 182.5; // ~6 months
  return Math.max(0, Math.ceil(periodsRemaining));
}

/**
 * Calculate days until maturity
 */
function calculateDaysUntilMaturity(maturityDate: string): number {
  const now = new Date();
  const maturity = new Date(maturityDate);
  return Math.max(0, Math.floor((maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate Fair Market Value using Present Value formula
 * 
 * Price = Σ (C / (1 + r)^t) + FV / (1 + r)^n
 * 
 * Where:
 * - C = Coupon payment per period
 * - r = Market rate per period
 * - FV = Face Value (Principal)
 * - n = Number of remaining periods
 * - t = Each period from 1 to n
 */
export function calculateFairMarketValue(input: BondPricingInput): BondPricingResult {
  const {
    faceValue,
    couponRate,
    maturityDate,
    marketRate = couponRate + 1.5, // Default market rate slightly higher (early sale penalty)
  } = input;

  const daysUntilMaturity = calculateDaysUntilMaturity(maturityDate);
  const isBeforeMaturity = daysUntilMaturity > 0;
  
  // If at or past maturity, return full value
  if (!isBeforeMaturity) {
    return {
      fairMarketValue: faceValue,
      originalValue: faceValue,
      discountAmount: 0,
      discountPercentage: 0,
      remainingPeriods: 0,
      forfeitedInterest: 0,
      isBeforeMaturity: false,
      daysUntilMaturity: 0,
    };
  }

  const remainingPeriods = calculateRemainingPeriods(maturityDate);
  
  // Convert annual rates to semi-annual (per period)
  const couponPerPeriod = (couponRate / 100) * faceValue / 2; // Semi-annual coupon
  const marketRatePerPeriod = (marketRate / 100) / 2; // Semi-annual market rate

  // Calculate Present Value of remaining coupons
  let presentValueOfCoupons = 0;
  for (let t = 1; t <= remainingPeriods; t++) {
    presentValueOfCoupons += couponPerPeriod / Math.pow(1 + marketRatePerPeriod, t);
  }

  // Calculate Present Value of face value at maturity
  const presentValueOfFaceValue = faceValue / Math.pow(1 + marketRatePerPeriod, remainingPeriods);

  // Total fair market value (discounted)
  let fairMarketValue = presentValueOfCoupons + presentValueOfFaceValue;
  
  // Ensure fair value doesn't exceed original (no premium on early sale)
  fairMarketValue = Math.min(fairMarketValue, faceValue);
  
  // Apply additional early exit penalty based on time remaining
  // The earlier the exit, the higher the penalty
  const timeRemainingRatio = Math.min(1, daysUntilMaturity / 365); // Cap at 1 year ratio
  const earlyExitPenalty = 0.02 * timeRemainingRatio; // Up to 2% penalty
  fairMarketValue = fairMarketValue * (1 - earlyExitPenalty);
  
  // Round to 2 decimal places
  fairMarketValue = Math.round(fairMarketValue * 100) / 100;

  const discountAmount = faceValue - fairMarketValue;
  const discountPercentage = (discountAmount / faceValue) * 100;

  // Calculate forfeited interest (what they would have earned if held to maturity)
  const totalRemainingCoupons = couponPerPeriod * remainingPeriods;
  const forfeitedInterest = Math.round(totalRemainingCoupons * 100) / 100;

  return {
    fairMarketValue,
    originalValue: faceValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercentage: Math.round(discountPercentage * 100) / 100,
    remainingPeriods,
    forfeitedInterest,
    isBeforeMaturity,
    daysUntilMaturity,
  };
}

/**
 * Format pricing result for display
 */
export function formatPricingDetails(result: BondPricingResult): string {
  if (!result.isBeforeMaturity) {
    return 'Bond has reached maturity - full value available';
  }
  
  return `Fair Market Value: $${result.fairMarketValue.toLocaleString()} ` +
         `(${result.discountPercentage.toFixed(1)}% discount, ` +
         `${result.remainingPeriods} periods remaining)`;
}
