import connectDB from '@/lib/database';
import Bill from '@/models/Bill';

export async function getDashboardStats(userId) {
  await connectDB();

  const [stats] = await Bill.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
        pendingBills: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        overdueBills: {
          $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
        },
        totalUsage: { $sum: '$energyUsage' },
        totalAmountDue: { $sum: '$amountDue' }
      }
    }
  ]);

  return stats || {
    totalBills: 0,
    pendingBills: 0,
    overdueBills: 0,
    totalUsage: 0,
    totalAmountDue: 0
  };
}
