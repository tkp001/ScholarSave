import React from 'react';
import { PulseLoader } from 'react-spinners';

const ExportSummaries = ({ aiInsight, exportSummariesToPDF }) => (
  <div className="flex flex-col items-center bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5 fade-in scale-on-hover">
    <div className="text-xl mb-2">Export Summaries</div>
    {aiInsight && (
      <div className='fade-in'>
        <button
          className="bg-blue-500 w-180 text-white font-bold py-2 px-4 rounded scale-on-hover"
          onClick={exportSummariesToPDF}
        >
          Export as PDF
        </button>
      </div>
    )}
    <PulseLoader
      className='my-2 fade-in'
      color={"white"}
      loading={!aiInsight}
      size={15}
    />
  </div>
);

export default ExportSummaries;
