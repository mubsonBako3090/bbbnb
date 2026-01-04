import BillsClient from './BillsClient';

async function getBills(userId) {
  try {
    // Use the new billing API endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000'}/api/bills`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch bills:', res.status, res.statusText);
      throw new Error('Failed to fetch bills');
    }

    const data = await res.json();
    
    // New API structure: data.data.bills, data.data.currentBill, data.data.summary
    return {
      bills: data.data?.bills || [],
      currentBill: data.data?.currentBill || null,
      summary: data.data?.summary || {},
      pagination: data.data?.pagination || {},
    };
  } catch (error) {
    console.error('Error in getBills:', error.message);
    return {
      bills: [],
      currentBill: null,
      summary: {},
      pagination: {},
    };
  }
}

async function getUserData(userId) {
  try {
    // Get user details for the bill page
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000'}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return data.data?.user || {};
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
  return {};
}

export default async function BillsServer({ user }) {
  try {
    // Fetch bills and user data in parallel
    const [billsData, userData] = await Promise.all([
      getBills(user.id),
      getUserData(user.id)
    ]);

    // Prepare the data for BillsClient
    const clientData = {
      bills: billsData.bills,
      currentBill: billsData.currentBill,
      summary: billsData.summary,
      pagination: billsData.pagination,
      user: {
        id: user.id,
        ...userData,
        // Ensure we have account number and meter number
        accountNumber: userData.accountNumber || user.accountNumber || `ACC-${user.id.slice(-6)}`,
        meterNumber: userData.meterNumber || user.meterNumber,
      }
    };

    return <BillsClient initialData={clientData} />;
  } catch (error) {
    console.error('Error in BillsServer:', error);
    
    // Return empty data but still render the client component
    return <BillsClient initialData={{
      bills: [],
      currentBill: null,
      summary: {},
      pagination: {},
      user: {
        id: user.id,
        accountNumber: user.accountNumber || `ACC-${user.id.slice(-6)}`,
        meterNumber: user.meterNumber,
      }
    }} />;
  }
}