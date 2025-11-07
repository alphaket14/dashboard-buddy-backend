// Fee constants
const DEFAULT_STRIPE_FEE_RATE = 0.029;
const DEFAULT_STRIPE_FLAT_FEE = 0.3;

/**
 * Calculate the platform fee based on fee type and amount.
 * @param {number} amount - The base amount (service cost).
 * @param {object} platform - The active platform config.
 * @returns {number}
 */
export function calculatePlatformFee(amount, platform) {
  if (!platform) return 0;
  if (platform.feeType === "percentage") {
    return (amount * platform.currentFee) / 100;
  } else if (platform.feeType === "fixed") {
    return platform.currentFee;
  }
  return 0;
}


/**
 * Round up to the nearest cent (0.01)
 * @param {number} amount
 * @returns {number}
 */
function roundUpToCent(amount) {
  return Math.ceil(amount * 100) / 100;
}

/**
 * Calculate the Stripe fee using reverse calculation.
 * @param {number} amountToReceive - The amount you want to receive after Stripe fees.
 * @param {number} [stripeFeeRate=DEFAULT_STRIPE_FEE_RATE] - Stripe fee rate.
 * @param {number} [stripeFlatFee=DEFAULT_STRIPE_FLAT_FEE] - Stripe flat fee.
 * @returns {object} { totalCharge, stripeFee }
 */
export function calculateStripeFeeReverse(
  amountToReceive,
  stripeFeeRate = DEFAULT_STRIPE_FEE_RATE,
  stripeFlatFee = DEFAULT_STRIPE_FLAT_FEE
) {
  const totalCharge = (amountToReceive + stripeFlatFee) / (1 - stripeFeeRate);
  const stripeFee = totalCharge - amountToReceive;
  return {
    totalCharge: roundUpToCent(totalCharge),
    stripeFee: roundUpToCent(stripeFee),
  };
}

/**
 * Calculate all fees and total cost for a transaction.
 * @param {number} amount - The base amount (service cost).
 * @param {object} platform - The active platform config.
 * @returns {object} { platformFee, stripeFee, totalServiceFee, totalServiceCost }
 */
export function calculateAllFees(amount, platform) {
  const platformFee = calculatePlatformFee(amount, platform);
  const { totalCharge, stripeFee } = calculateStripeFeeReverse(amount + platformFee);
  const totalServiceFee = platformFee + stripeFee;
  return {
    platformFee: roundUpToCent(platformFee),
    stripeFee: stripeFee,
    totalServiceFee: roundUpToCent(totalServiceFee),
    totalServiceCost: roundUpToCent(totalCharge),
  };
}

/**
 * Calculate the total charge amount so that after Stripe fees,
 * you receive the intended amount (service + platform fee).
 * @param {number} appointmentPrice - The base service price.
 * @param {object} platform - The active platform config (must include feeType and currentFee).
 * @param {number} [stripeFeeRate=DEFAULT_STRIPE_FEE_RATE]
 * @param {number} [stripeFlatFee=DEFAULT_STRIPE_FLAT_FEE]
 * @returns {number} Total amount to charge the customer
 */
export function calculateTotalWithStripeFee(
  appointmentPrice,
  platform,
  stripeFeeRate = DEFAULT_STRIPE_FEE_RATE,
  stripeFlatFee = DEFAULT_STRIPE_FLAT_FEE
) {
  let amountToReceive;
  if (platform.feeType === "percentage") {
    const commissionRate = platform.currentFee / 100;
    amountToReceive = appointmentPrice * (1 + commissionRate);
  } else if (platform.feeType === "fixed") {
    amountToReceive = appointmentPrice + platform.currentFee;
  } else {
    throw new Error("Invalid platform fee type.");
  }
  const totalToCharge = (amountToReceive + stripeFlatFee) / (1 - stripeFeeRate);
  return roundUpToCent(totalToCharge);
}