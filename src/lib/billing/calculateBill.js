/**
 * Calculate electricity bill based on consumption and rate plan
 * @param {Object} params
 * @param {Number} params.consumption - kWh consumed
 * @param {String} params.ratePlan - 'residential', 'commercial', 'industrial'
 * @param {Number} params.taxRate - Tax rate (default 0.05 = 5%)
 * @param {Number} params.previousBalance - Previous unpaid balance
 * @returns {Object} - Calculated bill breakdown
 */
export function calculateBill(params) {
  const {
    consumption,
    ratePlan = 'residential',
    taxRate = 0.05,
    previousBalance = 0,
  } = params;

  // Define rate structures for different plans
  const rateStructures = {
    residential: [
      { min: 0, max: 50, rate: 4.0 },     // First 50 kWh
      { min: 51, max: 100, rate: 13.0 },  // Next 50 kWh
      { min: 101, max: 200, rate: 18.0 }, // Next 100 kWh
      { min: 201, max: Infinity, rate: 22.0 }, // Above 200 kWh
    ],
    commercial: [
      { min: 0, max: 500, rate: 30.0 },
      { min: 501, max: Infinity, rate: 35.0 },
    ],
    industrial: [
      { min: 0, max: 1000, rate: 40.0 },
      { min: 1001, max: Infinity, rate: 45.0 },
    ],
  };

  const rates = rateStructures[ratePlan] || rateStructures.residential;
  let remaining = consumption;
  let energyCharge = 0;
  let breakdown = [];

  // Calculate energy charge based on tiered pricing
  for (const tier of rates) {
    if (remaining <= 0) break;

    const tierConsumption = Math.min(
      remaining,
      tier.max === Infinity ? remaining : tier.max - tier.min
    );

    if (tierConsumption > 0) {
      const tierCharge = tierConsumption * tier.rate;
      energyCharge += tierCharge;

      breakdown.push({
        tier: `${tier.min}${tier.max === Infinity ? '+' : `-${tier.max}`} kWh`,
        consumption: tierConsumption,
        rate: tier.rate,
        charge: tierCharge,
      });

      remaining -= tierConsumption;
    }
  }

  // Fixed monthly service fee
  const serviceFees = {
    residential: 500,   // ₦500
    commercial: 2000,   // ₦2000
    industrial: 5000,   // ₦5000
  };

  const serviceFee = serviceFees[ratePlan] || serviceFees.residential;

  // Calculate subtotal
  const subtotal = energyCharge + serviceFee + previousBalance;

  // Calculate tax
  const tax = subtotal * taxRate;

  // Calculate total
  const total = subtotal + tax;

  // Calculate average rate per kWh
  const ratePerKWh = consumption > 0 ? energyCharge / consumption : 0;

  return {
    consumption,
    ratePlan,
    energyCharge,
    serviceFee,
    previousBalance,
    subtotal,
    taxRate,
    tax,
    total,
    ratePerKWh,
    breakdown,
  };
}

/**
 * Calculate late fee for overdue bills
 * @param {Number} amountDue - Current amount due
 * @param {Number} overdueDays - Number of days overdue
 * @param {Number} lateFeeRate - Daily late fee rate (default 0.001 = 0.1% per day)
 * @returns {Number} - Late fee amount
 */
export function calculateLateFee(amountDue, overdueDays, lateFeeRate = 0.001) {
  if (overdueDays <= 0 || amountDue <= 0) return 0;
  
  const dailyFee = amountDue * lateFeeRate;
  return dailyFee * overdueDays;
}

/**
 * Generate bill summary for display
 * @param {Object} bill - Bill document
 * @returns {Object} - Formatted summary
 */
export function formatBillSummary(bill) {
  return {
    billNumber: bill.billNumber,
    period: `${new Date(bill.billingPeriod.start).toLocaleDateString()} - ${new Date(bill.billingPeriod.end).toLocaleDateString()}`,
    dueDate: new Date(bill.dueDate).toLocaleDateString(),
    totalAmount: `₦${bill.totalAmount.toFixed(2)}`,
    amountDue: `₦${bill.amountDue.toFixed(2)}`,
    status: bill.status,
    isOverdue: bill.status === 'overdue',
    daysRemaining: bill.daysRemaining,
    consumption: `${bill.meterReading.consumption} kWh`,
  };
}