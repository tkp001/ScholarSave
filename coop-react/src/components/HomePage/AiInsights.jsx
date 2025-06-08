import React from 'react';
import { PulseLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';

const AiInsights = ({
  aiInsight,
  aiQuestion,
  setAiQuestion,
  askAiQuestion,
  aiLoading,
  aiAnswer
}) => (
  <div className="rounded-3xl flex flex-col bg-gray-700 w-200 h-fit my-2 py-5 p-3 fade-in">
    <div className="text-xl">ScholarSave Insights AI</div>
    <div className='italic text-sm font-bold my-2'>Disclaimer: AI is not a financial advisor.</div>
    {aiInsight && (
      <div className="fade-in">{aiInsight}</div>
    )}
    <PulseLoader
      className='justify-center my-2 fade-in'
      color={"white"}
      loading={!aiInsight}
      size={15}
    />
    {aiInsight && (
      <div className="flex flex-row my-3 fade-in">
        <input
          className="border-2 border-gray-500 rounded-xl p-2 w-full mr-2"
          type="text"
          placeholder="Ask a finance question..."
          value={aiQuestion}
          onChange={e => setAiQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') askAiQuestion(); }}
        />
        <button
          className="bg-blue-500 text-white rounded-xl px-4 py-2 scale-on-hover"
          onClick={askAiQuestion}
          disabled={aiLoading}
        >
          Ask
        </button>
      </div>
    )}
    {aiLoading && (
      <PulseLoader
        className='justify-center my-2 fade-in'
        color={"white"}
        loading={aiLoading}
        size={15}
      />
    )}
    {aiQuestion && aiAnswer && (
      <div className="fade-in">
        <div className="font-bold">Question:</div>
        <div className="mb-2">{aiQuestion}</div>
        <div className="font-bold">Answer:</div>
        <div><ReactMarkdown>{aiAnswer}</ReactMarkdown></div>
      </div>
    )}
  </div>
);

export default AiInsights;
