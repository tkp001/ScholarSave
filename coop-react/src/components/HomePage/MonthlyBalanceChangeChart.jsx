import React from 'react';
import { Bar } from 'react-chartjs-2';

const MonthlyBalanceChangeChart = ({ BDMonthlyBalanceChange, BOMonthlyBalanceChange }) => (
  <div className="flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5 fade-in">
    <div className="text-xl mb-2">Monthly Balance Change</div>
    {BDMonthlyBalanceChange.datasets[0].data.length > 0 ? (
      <Bar data={BDMonthlyBalanceChange} options={BOMonthlyBalanceChange} />
    ) : (
      <div className="text-center text-gray-400">No data available</div>
    )}
  </div>
);

export default MonthlyBalanceChangeChart;
