// components/dashboard/UsageChart.jsx
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UsageChart({ readings }) {
  // readings: array of { usage: number, date: string }

  // Format data for chart
  const chartData = readings.map(r => ({
    month: new Date(r.date).toLocaleString('default', { month: 'short' }),
    usage: r.usage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis unit=" kWh" />
        <Tooltip formatter={(value) => `${value} kWh`} />
        <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
