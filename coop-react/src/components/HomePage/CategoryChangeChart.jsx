import React from 'react';
import { Bar } from 'react-chartjs-2';

const CategoryChangeChart = ({ categoryChangeData, BOcategoryChangeData }) => (
  <div className="flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5 fade-in">
    <div className="text-xl mb-2">Category Change Per Month</div>
    {categoryChangeData.labels.length > 0 ? (
      <Bar data={categoryChangeData} options={BOcategoryChangeData} />
    ) : (
      <div className="text-center text-gray-400">No data available</div>
    )}
  </div>
);

export default CategoryChangeChart;
