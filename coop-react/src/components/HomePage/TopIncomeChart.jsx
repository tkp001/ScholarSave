import React from 'react';
import { Pie } from 'react-chartjs-2';

const TopIncomeChart = ({ top5Income, incomeData }) => (
  <div className="flex flex-col bg-gray-700 w-99 h-fit rounded-3xl p-5 fade-in">
    <div className="text-xl mb-2">Top 5 Income</div>
    {top5Income.length > 0 ? (
      <Pie data={incomeData} />
    ) : (
      <div className="text-center text-gray-400">No data available</div>
    )}
  </div>
);

export default TopIncomeChart;
