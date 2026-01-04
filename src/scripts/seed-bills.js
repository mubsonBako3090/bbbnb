#!/usr/bin/env node

/**
 * Seed script to populate database with sample bills
 * Usage: node scripts/seed-bills.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '@/models/User';
import Bill from '@/models/Bill';
import Usage from '@/models/Usage';
import { calculateBill } from '@/lib/billing/calculateBill';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Sample data
const SAMPLE_CUSTOMERS = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    accountNumber: 'ACC-001',
    serviceAddress: '123 Main Street, Lagos',
    meterNumber: 'MTR-001',
    ratePlan: 'residential',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    accountNumber: 'ACC-002',
    serviceAddress: '456 Oak Avenue, Abuja',
    meterNumber: 'MTR-002',
    ratePlan: 'commercial',
  },
  {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@example.com',
    accountNumber: 'ACC-003',
    serviceAddress: '789 Pine Road, Port Harcourt',
    meterNumber: 'MTR-003',
    ratePlan: 'residential',
  },
];

const BILLING_PERIODS = [
  {
    start: new Date(2024, 0, 1), // Jan 1, 2024
    end: new Date(2024, 0, 31),  // Jan 31, 2024
    due: new Date(2024, 1, 15),  // Feb 15, 2024
  },
  {
    start: new Date(2024, 1, 1), // Feb 1, 2024
    end: new Date(2024, 1, 29),  // Feb 29, 2024
    due: new Date(2024, 2, 15),  // Mar 15, 2024
  },
  {
    start: new Date(2024, 2, 1), // Mar 1, 2024
    end: new Date(2024, 2, 31),  // Mar 31, 2024
    due: new Date(2024, 3, 15),  // Apr 15, 2024
  },
];

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function createSampleCustomers() {
  console.log('📝 Creating sample customers...');
  
  const customers = [];
  
  for (const customerData of SAMPLE_CUSTOMERS) {
    // Check if customer exists
    let customer = await User.findOne({ email: customerData.email });
    
    if (!customer) {
      customer = new User({
        ...customerData,
        role: 'customer',
        password: '$2a$10$ExampleHashForTesting123', // Hashed "password123"
        isActive: true,
        accountStatus: 'active',
        createdAt: new Date(),
      });
      
      await customer.save();
      console.log(`   Created customer: ${customer.firstName} ${customer.lastName}`);
    } else {
      console.log(`   Customer exists: ${customer.firstName} ${customer.lastName}`);
    }
    
    customers.push(customer);
  }
  
  return customers;
}

async function createSampleUsage(customer, period) {
  // Generate random usage data
  const baseConsumption = customer.ratePlan === 'commercial' ? 800 : 250;
  const consumption = baseConsumption + Math.floor(Math.random() * 200);
  const previousReading = Math.floor(Math.random() * 10000);
  const currentReading = previousReading + consumption;
  
  const usage = new Usage({
    userId: customer._id,
    meterNumber: customer.meterNumber,
    readingDate: period.end,
    readingType: 'manual',
    currentReading,
    previousReading,
    consumption,
    ratePlan: customer.ratePlan,
    rateApplied: customer.ratePlan === 'commercial' ? 30 : 15,
    verified: true,
  });
  
  await usage.save();
  return usage;
}

async function createSampleBills(customers) {
  console.log('🧾 Creating sample bills...');
  
  const bills = [];
  
  for (const customer of customers) {
    for (const period of BILLING_PERIODS) {
      // Check if bill already exists for this period
      const existingBill = await Bill.findOne({
        userId: customer._id,
        'billingPeriod.start': period.start,
        'billingPeriod.end': period.end,
      });
      
      if (existingBill) {
        console.log(`   Bill exists for ${customer.accountNumber} (${period.start.toLocaleDateString()})`);
        continue;
      }
      
      // Create usage data
      const usage = await createSampleUsage(customer, period);
      
      // Calculate bill
      const billCalculation = calculateBill({
        consumption: usage.consumption,
        ratePlan: customer.ratePlan,
        taxRate: 0.05,
        previousBalance: Math.random() > 0.7 ? 1500 : 0, // 30% chance of previous balance
      });
      
      // Create bill
      const bill = new Bill({
        userId: customer._id,
        billingPeriod: {
          start: period.start,
          end: period.end,
        },
        dueDate: period.due,
        issueDate: new Date(),
        
        // Customer Information
        customerName: `${customer.firstName} ${customer.lastName}`,
        serviceAddress: customer.serviceAddress,
        accountNumber: customer.accountNumber,
        meterNumber: customer.meterNumber,
        
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
        
        // Payment Tracking
        previousBalance: billCalculation.previousBalance,
        totalPaid: 0,
        
        // Status (randomize for demo)
        status: Math.random() > 0.5 ? 'generated' : 'paid',
        
        // Payment info if paid
        ...(Math.random() > 0.5 ? {
          paidAt: new Date(),
          paymentMethod: ['card', 'bank', 'opay'][Math.floor(Math.random() * 3)],
          totalPaid: billCalculation.total,
          amountDue: 0,
        } : {}),
        
        // Payment Instructions
        paymentInstructions: 'Pay online through your customer portal, via bank transfer, or at any of our offices.',
      });
      
      await bill.save();
      
      // Link usage to bill
      usage.billId = bill._id;
      await usage.save();
      
      bills.push(bill);
      console.log(`   Created bill: ${bill.billNumber} - ₦${bill.totalAmount} (${bill.status})`);
    }
  }
  
  return bills;
}

async function main() {
  console.log('🚀 Starting bill seed script...');
  
  try {
    await connectDatabase();
    
    // Clear existing sample data (optional)
    if (process.argv.includes('--clean')) {
      console.log('🧹 Cleaning existing sample data...');
      await Bill.deleteMany({ accountNumber: /^ACC-00[1-3]$/ });
      await Usage.deleteMany({ meterNumber: /^MTR-00[1-3]$/ });
    }
    
    const customers = await createSampleCustomers();
    const bills = await createSampleBills(customers);
    
    console.log('\n✅ Seed completed successfully!');
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Bills: ${bills.length}`);
    
    // Display sample API call
    console.log('\n📋 Sample API calls:');
    console.log('   GET /api/bills - View your bills');
    console.log('   GET /api/bills/[id] - View bill details');
    console.log('   POST /api/bills/[id]/pay - Make a payment');
    
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;