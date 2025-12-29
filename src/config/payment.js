// Payment configuration
const paymentConfig = {
  // Stripe configuration (for production)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Payment methods
  methods: [
    {
      id: "credit_card",
      name: "Credit Card",
      enabled: true,
      currencies: ["USD"],
      fees: {
        percentage: 2.9,
        fixed: 0.3,
      },
    },
    {
      id: "debit_card",
      name: "Debit Card",
      enabled: true,
      currencies: ["USD"],
      fees: {
        percentage: 2.2,
        fixed: 0.3,
      },
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      enabled: true,
      currencies: ["USD"],
      fees: {
        percentage: 0,
        fixed: 0,
      },
    },
    {
      id: "echeck",
      name: "E-Check",
      enabled: true,
      currencies: ["USD"],
      fees: {
        percentage: 1.5,
        fixed: 0.25,
      },
    },
  ],

  // Payment limits
  limits: {
    minAmount: 1.0,
    maxAmount: 10000.0,
    dailyLimit: 5000.0,
  },

  // Supported currencies
  currencies: {
    USD: {
      symbol: "$",
      decimal: 2,
    },
  },

  // Auto-pay settings
  autoPay: {
    enabled: true,
    defaultDaysBeforeDue: 3,
  },
};

export default paymentConfig;
