export const config = {
  listingLimit: {
    enabled: process.env.LISTING_LIMIT_ENFORCED === 'true',
    freeListings: 3,
    pricePerListing: 500, // ETB
  },
  subscriptionPlans: [
    {
      id: 'MONTHLY',
      name: 'Monthly Subscription',
      price: 1500, // ETB
      duration: 30, // days
      description: 'Unlimited vehicle listings for 1 month'
    },
    {
      id: 'QUARTERLY',
      name: 'Quarterly Subscription',
      price: 4000, // ETB
      duration: 90, // days
      description: 'Unlimited vehicle listings for 3 months',
      savings: 'Save 500 ETB'
    },
    {
      id: 'YEARLY',
      name: 'Yearly Subscription',
      price: 15000, // ETB
      duration: 365, // days
      description: 'Unlimited vehicle listings for 1 year',
      savings: 'Save 3000 ETB'
    }
  ] as const,
  paymentMethods: [
    { value: 'TELEBIRR', label: 'Telebirr' },
    { value: 'CBE', label: 'CBE Birr' },
    { value: 'AMOLE', label: 'Amole' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CASH', label: 'Cash' },
  ],
  paymentDetails: {
    telebirr: {
      number: '0912345678',
      name: 'AddisWheels Admin'
    },
    cbe: {
      accountNumber: '1000123456789',
      accountName: 'AddisWheels Admin',
      bankName: 'Commercial Bank of Ethiopia'
    },
    amole: {
      number: '0912345678',
      name: 'AddisWheels Admin'
    },
    bankTransfer: {
      accountNumber: '1000123456789',
      accountName: 'AddisWheels Admin',
      bankName: 'Commercial Bank of Ethiopia',
      branch: 'Addis Ababa Main Branch'
    },
    contact: {
      phone: '+251912345678',
      email: 'payments@addiswheels.com'
    }
  }
} as const;

export type PaymentMethod = typeof config.paymentMethods[number]['value']; 