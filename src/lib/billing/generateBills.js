import User from '@/models/User';
import Bill from '@/models/Bill';
import Usage from '@/models/Usage';
import { calculateBill } from './calculateBill';
import { sendBillNotification } from '@/lib/email';

/**
 * Generate monthly bills for all active customers
 * @param {Object} options - Generation options
 * @param {Date} options.billingDate - Date for billing period (defaults to previous month)
 * @param {String} options.mode - 'auto' or 'manual'
 * @param {String} options.generatedBy - Admin user ID who triggered generation
 * @returns {Promise<Array>} - Array of generated bills
 */
export async function generateMonthlyBills(options = {}) {
  try {
    const {
      billingDate = new Date(),
      mode = 'auto',
      generatedBy = null,
    } = options;

    // Calculate billing period (previous month)
    const currentDate = new Date(billingDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    
    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    const startDate = new Date(prevYear, prevMonth, 1);
    const endDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999);
    const dueDate = new Date(prevYear, prevMonth + 1, 15); // Due on 15th of next month

    console.log(`Generating bills for period: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    // Get all active customers
    const customers = await User.find({ 
      role: 'customer', 
      accountStatus: 'active',
      isActive: true,
    }).select('_id firstName lastName email serviceAddress accountNumber meterNumber ratePlan taxRate');

    console.log(`Found ${customers.length} active customers`);

    const generatedBills = [];
    const errors = [];

    // Process each customer
    for (const customer of customers) {
      try {
        // Check if bill already exists for this period
        const existingBill = await Bill.findOne({
          userId: customer._id,
          'billingPeriod.start': startDate,
          'billingPeriod.end': endDate,
        });

        if (existingBill) {
          console.log(`Bill already exists for customer ${customer.accountNumber}, skipping...`);
          continue;
        }

        // Get usage data for the billing period
        const usage = await Usage.findOne({
          userId: customer._id,
          readingDate: {
            $gte: startDate,
            $lte: endDate,
          },
        }).sort({ readingDate: -1 });

        if (!usage) {
          console.log(`No usage data found for customer ${customer.accountNumber}, using estimated values`);
          // In production, you might want to estimate or skip
          continue;
        }

        // Calculate bill amount
        const billCalculation = calculateBill({
          consumption: usage.consumption,
          ratePlan: customer.ratePlan || 'residential',
          taxRate: customer.taxRate || 0.05,
          previousBalance: 0, // You would fetch this from previous bills
        });

        // Create bill document
        const billData = {
          userId: customer._id,
          billingPeriod: {
            start: startDate,
            end: endDate,
          },
          dueDate: dueDate,
          issueDate: new Date(),
          
          // Customer Information
          customerName: `${customer.firstName} ${customer.lastName}`,
          serviceAddress: customer.serviceAddress,
          accountNumber: customer.accountNumber,
          meterNumber: customer.meterNumber || `MTR-${customer.accountNumber}`,
          
          // Usage Information
          meterReading: {
            previous: usage.previousReading,
            current: usage.currentReading,
            consumption: usage.consumption,
          },
          
          // Charges Breakdown
          charges: [
            {
              description: 'Energy Consumption',
              amount: billCalculation.energyCharge,
              rate: billCalculation.ratePerKWh,
              units: usage.consumption,
              type: 'energy',
            },
            {
              description: 'Monthly Service Fee',
              amount: billCalculation.serviceFee,
              type: 'service',
            },
            {
              description: 'VAT (5%)',
              amount: billCalculation.tax,
              type: 'tax',
            },
          ],
          
          // Financial Summary
          subtotal: billCalculation.subtotal,
          taxRate: billCalculation.taxRate,
          taxAmount: billCalculation.tax,
          totalAmount: billCalculation.total,
          amountDue: billCalculation.total,
          
          // Status
          status: 'generated',
          generatedBy: generatedBy,
          
          // Payment Instructions
          paymentInstructions: 'Pay online through your customer portal, via bank transfer to account 1234567890, or at any of our offices.',
        };

        const bill = new Bill(billData);
        await bill.save();

        // Link usage to bill
        usage.billId = bill._id;
        await usage.save();

        // Send notification (optional)
        if (mode === 'auto') {
          try {
            await sendBillNotification(customer.email, bill);
          } catch (emailError) {
            console.error('Failed to send email:', emailError.message);
          }
        }

        generatedBills.push(bill);
        console.log(`Generated bill ${bill.billNumber} for ${customer.accountNumber}: ₦${bill.totalAmount}`);

      } catch (customerError) {
        console.error(`Error generating bill for customer ${customer.accountNumber}:`, customerError.message);
        errors.push({
          customer: customer.accountNumber,
          error: customerError.message,
        });
      }
    }

    return {
      success: true,
      message: `Generated ${generatedBills.length} bills successfully`,
      generatedBills,
      errors,
      period: {
        start: startDate,
        end: endDate,
        due: dueDate,
      },
    };

  } catch (error) {
    console.error('Error in generateMonthlyBills:', error);
    throw error;
  }
}

/**
 * Generate bills for specific customers manually
 * @param {Array} customerIds - Array of customer IDs
 * @param {Object} period - Custom period
 * @returns {Promise<Array>} - Generated bills
 */
export async function generateBillsForCustomers(customerIds, period = null) {
  // Similar logic but filtered by customerIds
  // Implementation would be similar to above but filtered
}