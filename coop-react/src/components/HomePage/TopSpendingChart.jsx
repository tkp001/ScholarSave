import React from 'react';
import { Pie } from 'react-chartjs-2';

const TopSpendingChart = ({ top5Spending, spendingData }) => (
  <div className="flex flex-col bg-gray-700 w-99 h-fit rounded-3xl mr-2 p-5 fade-in">
    <div className="text-xl mb-2">Top 5 Spending</div>
    {top5Spending.length > 0 ? (
      <Pie data={spendingData} />
    ) : (
      <div className="text-center text-gray-400">No data available</div>
    )}
  </div>
);

export default TopSpendingChart;
