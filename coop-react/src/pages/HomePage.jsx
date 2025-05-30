import React, { useContext, useEffect, useState, useRef, use } from 'react'; 
import UserContext from '../UserContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { GoogleGenAI } from "@google/genai";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto'; // MUST INCLUDE TO DESTROY UPON UNMOUNTING
import AccountViewer from '../components/AccountViewer';
import jsPDF from "jspdf";
import { PulseLoader } from "react-spinners";
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

// import { Chart } from 'chart.js/auto';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HomePage = () => {
  const { user } = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {updateViewedAccount} = useContext(UserContext);
  const {fetchAccounts} = useContext(UserContext);
  const {accounts} = useContext(UserContext);
  const {toastMessage} = useContext(UserContext);
  const [aiInsight, setAiInsight] = useState(null);
  const [animateKey, setAnimateKey] = useState(0);

  const api = import.meta.env.VITE_API_GOOGLE_GENAI
  const ai = new GoogleGenAI({ apiKey: api });

  // Monthly balance
  function getMonthlyBalanceChange(accountData) {
    if (!accountData || !accountData.categoryBreakdown || !accountData.categoryBreakdown[2025]) {
      return []; // Return an empty array if data is missing
    }
    return Object.entries(accountData.categoryBreakdown[2025])
    .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB)) // Sort months numerically
    .map(([month, categories]) => {
      const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
      return { month, total };
    });
  }

  function getMonthlyBalances(accountData, initialBalance = 0) {
    if (!accountData || !accountData.categoryBreakdown || !accountData.categoryBreakdown[2025]) {
      return [];
    }
  
    // Get monthly changes
    const monthlyChanges = Object.entries(accountData.categoryBreakdown[2025])
      .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
      .map(([month, categories]) => {
        const totalChange = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
        return { month, totalChange };
      });
  
    // Calculate cumulative balances
    let cumulativeBalance = initialBalance;
    const monthlyBalances = monthlyChanges.map(({ month, totalChange }) => {
      cumulativeBalance += totalChange; // Add monthly change to cumulative balance
      return { month, balance: cumulativeBalance };
    });
  
    return monthlyBalances;
  }

  // Top 5 category spending
  function getTop5CategorySpending(accountData) {
    if (!accountData || !accountData.categoryBreakdown || !accountData.categoryBreakdown[2025]) {
      return [];
    }
    const categoryTotals = Object.entries(accountData.categoryBreakdown[2025]).reduce(
      (acc, [month, categories]) => {
        Object.entries(categories).forEach(([category, amount]) => {
          acc[category] = (acc[category] || 0) + amount;
        });
        return acc;
      },
      {}
    );

    return Object.entries(categoryTotals)
      .filter(([category, amount]) => amount < 0) // Only spending (negative amounts)
      .sort((a, b) => a[1] - b[1]) // Sort by most spending
      .slice(0, 5);
  }

  // Top 5 category income
  function getTop5CategoryIncome(accountData) {
    if (!accountData || !accountData.categoryBreakdown || !accountData.categoryBreakdown[2025]) {
      return [];
    }
    const categoryTotals = Object.entries(accountData.categoryBreakdown[2025]).reduce(
      (acc, [month, categories]) => {
        Object.entries(categories).forEach(([category, amount]) => {
          acc[category] = (acc[category] || 0) + amount;
        });
        return acc;
      },
      {}
    );

    return Object.entries(categoryTotals)
      .filter(([category, amount]) => amount > 0) // Only income (positive amounts)
      .sort((a, b) => b[1] - a[1]) // Sort by most income
      .slice(0, 5);
  }

  // Category amounts per month
  function getCategoryAmountsPerMonth(accountData) {
    if (!accountData || !accountData.categoryBreakdown || !accountData.categoryBreakdown[2025]) {
      return { labels: [], datasets: [] };
    }
  
    const monthlyData = Object.entries(accountData.categoryBreakdown[2025])
      .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
      .map(([month, categories]) => ({ month, categories }));
  
    // Get all unique categories
    const allCategories = Array.from(
      new Set(monthlyData.flatMap(({ categories }) => Object.keys(categories)))
    );
  
    // Prepare datasets for each category
    const datasets = allCategories.map((category) => ({
      label: category,
      data: monthlyData.map(({ categories }) => categories[category] || 0), // Use 0 if category is missing
      backgroundColor: getRandomColor(), // Assign a random color for each category
    }));
  
    // Prepare labels for months
    const labels = monthlyData.map(({ month }) => `Month ${month}`);
  
    return { labels, datasets };
  }
  
  // Helper function to generate random colors, internet function
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  

  // Prepare data, provide for charts
  const monthlyBalance = viewedAccount ? getMonthlyBalanceChange(viewedAccount) : [];
  const BDMonthlyBalanceChange = {
    labels: monthlyBalance.map((data) => `Month ${data.month}`), // X-axis labels
    datasets: [
      {
        label: 'Gain/Loss',
        data: monthlyBalance.map((data) => data.total), // Y-axis data
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
        borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
        borderWidth: 1,
      },
    ],
  };

  const BOMonthlyBalanceChange = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      // title: {
      //   display: true,
      //   text: 'Monthly Balance Change',
      // },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const monthlyBalances = viewedAccount ? getMonthlyBalances(viewedAccount, 0) : [];
  const BDMonthlyBalances = {
    labels: monthlyBalances.map((data) => `Month ${data.month}`), // X-axis labels
    datasets: [
      {
        label: 'Balance',
        data: monthlyBalances.map((data) => data.balance), // Y-axis data
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Bar color
        borderColor: 'rgba(54, 162, 235, 1)', // Bar border color
        borderWidth: 1,
      },
    ],
  };

  
  const top5Spending = viewedAccount ? getTop5CategorySpending(viewedAccount) : [];
  const spendingData = {
    labels: top5Spending.map(([category]) => category), // Categories
    datasets: [
      {
        label: 'Spending',
        data: top5Spending.map(([, amount]) => Math.abs(amount)), // Absolute values of spending
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // Colors
      },
    ],
  };

  const top5Income = viewedAccount ? getTop5CategoryIncome(viewedAccount) : [];
  
  const incomeData = {
    labels: top5Income.length > 0 ? top5Income.map(([category]) => category) : ['No Data'],
    datasets: [
      {
        label: 'Income',
        data: top5Income.length > 0 ? top5Income.map(([, amount]) => amount) : [0],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const categoryChangeData = viewedAccount ? getCategoryAmountsPerMonth(viewedAccount) : { labels: [], datasets: [] };
  const BOcategoryChangeData = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true, // Enable stacking on the x-axis
      },
      y: {
        stacked: true, // Enable stacking on the y-axis
        beginAtZero: true,
      },
    },
  }

  async function getAIInsights(accountData) {
    // Format the data into a readable string for AI
    const formattedData = `
      Monthly Balance: ${JSON.stringify(accountData.monthlyBalance, null, 2)}
      Top 5 Income: ${JSON.stringify(accountData.top5Income, null, 2)}
      Top 5 Spending: ${JSON.stringify(accountData.top5Spending, null, 2)}
      Monthly Balances: ${JSON.stringify(accountData.monthlyBalances, null, 2)}
      Category Change Data: ${JSON.stringify(accountData.categoryChangeData, null, 2)}
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        temperature: 0.2,
        contents: `Provide summarized in 100 words or less insights or suggestions based on the following user data:\n\n${formattedData}\n\n`,
      });
      // Log the response
      console.log("AI Insights Response:", response.text);
      setAiInsight(response.text);

    } catch (error) {
      toastMessage("Error getting AI insights", "error");
      setAiInsight("Sorry, there was an error getting insights.");
    }

    
  }
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function askAiQuestion() {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      const userData = getFormattedUserData();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        temperature: 0.2,
        contents: `Only answer finance related questions, User data:\n${userData}\n\nFinance question: ${aiQuestion}\n\nAnswer as if to a beginner. Use 100 words or less`,
      });
      setAiAnswer(response.text);
    } catch (err) {
      setAiAnswer("Sorry, there was an error getting an answer.");
      toastMessage("Error getting AI answer", "error");
    }
    setAiLoading(false);
  }

  function getFormattedUserData() {
    return `
      Monthly Balance: ${JSON.stringify(monthlyBalance, null, 2)}
      Top 5 Income: ${JSON.stringify(top5Income, null, 2)}
      Top 5 Spending: ${JSON.stringify(top5Spending, null, 2)}
      Monthly Balances: ${JSON.stringify(monthlyBalances, null, 2)}
      Category Change Data: ${JSON.stringify(categoryChangeData, null, 2)}
    `;
  }

  useEffect(() => {
    // Check if all required data is available
    setAiInsight(null); // Reset when account changes
    setAnimateKey((prevKey) => prevKey + 1);
    if (
      viewedAccount &&
      monthlyBalance.length > 0 &&
      (top5Income.length > 0 ||
      top5Spending.length > 0) &&
      monthlyBalances.length > 0 &&
      categoryChangeData.labels.length > 0
    ) {
      getAIInsights({
        monthlyBalance,
        top5Income,
        top5Spending,
        monthlyBalances,
        categoryChangeData,
      });
      console.log("AI Insights triggered");
    } else {
      setAiInsight("Please gather more data to view insights.");
      toastMessage("Please gather more data to view insights.", "warning");
    }
  }, [viewedAccount]);

  function exportSummariesToPDF() {
    const doc = new jsPDF();

    // Add a title
    doc.setFontSize(18);
    doc.text("ScholarSave Summaries", 10, 10);

    // Add Monthly Balance
    doc.setFontSize(14);
    doc.text("Monthly Balance:", 10, 20);
    monthlyBalances.forEach((data, index) => {
      doc.text(`Month ${data.month}: ${data.balance.toFixed(2)}`, 10, 30 + index * 10);
    });

    // Add Top 5 Spending
    doc.text("Top 5 Spending:", 10, 30 + monthlyBalances.length * 10);
    top5Spending.forEach(([category, amount], index) => {
      doc.text(`${index + 1}. ${category}: $${Math.abs(amount).toFixed(2)}`, 10, 40 + monthlyBalances.length * 10 + index * 10);
    });

    // Add Top 5 Income
    const incomeStartY = 40 + monthlyBalances.length * 10 + top5Spending.length * 10;
    doc.text("Top 5 Income:", 10, incomeStartY);
    top5Income.forEach(([category, amount], index) => {
      doc.text(`${index + 1}. ${category}: $${amount.toFixed(2)}`, 10, incomeStartY + 10 + index * 10);
    });

    // Add Disclaimer
    const disclaimerY = incomeStartY + 10 + top5Income.length * 10;
    doc.setFontSize(10);
    doc.text(
      "Disclaimer: This summary is generated for informational purposes only and is not financial advice.",
      10,
      disclaimerY
    );

    // Save the PDF
    doc.save("ScholarSave_Summaries.pdf");
  }


  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10">
        <AccountViewer />

        <div className="text-3xl my-3 fade-in">
          Welcome {user?.displayName || 'User'}
        </div>

        {!viewedAccount && (
          <div className="text-xl my-2 mb-5 fade-in">Please select an account to view details.</div>
        )}

        {viewedAccount && (
          <div
            key={animateKey} // Use the animation key to re-render the div
            className="flex flex-col stagger-container"
          > 
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

            <div className="flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5 fade-in">
              <div className="text-xl mb-2">Monthly Balance</div>
              {BDMonthlyBalances.datasets[0].data.length > 0 ? (
                <Bar data={BDMonthlyBalances} options={BOMonthlyBalanceChange} />
              ) : (
                <div className="text-center text-gray-400">No data available</div>
              )}
            </div>

            <div className="flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5 fade-in">
              <div className="text-xl mb-2">Monthly Balance Change</div>
              {BDMonthlyBalanceChange.datasets[0].data.length > 0 ? (
                <Bar data={BDMonthlyBalanceChange} options={BOMonthlyBalanceChange} />
              ) : (
                <div className="text-center text-gray-400">No data available</div>
              )}
            </div>

            <div className="flex flex-row my-2">
              <div className="flex flex-col bg-gray-700 w-99 h-fit rounded-3xl mr-2 p-5 fade-in">
                <div className="text-xl mb-2">Top 5 Spending</div>
                {top5Spending.length > 0 ? (
                  <Pie data={spendingData} />
                ) : (
                  <div className="text-center text-gray-400">No data available</div>
                )}
              </div>

              <div className="flex flex-col bg-gray-700 w-99 h-fit rounded-3xl p-5 fade-in">
                <div className="text-xl mb-2">Top 5 Income</div>
                {top5Income.length > 0 ? (
                  <Pie data={incomeData} />
                ) : (
                  <div className="text-center text-gray-400">No data available</div>
                )}
              </div>
            </div>

            <div className="flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5 fade-in">
              <div className="text-xl mb-2">Category Change Per Month</div>
              {categoryChangeData.labels.length > 0 ? (
                <Bar data={categoryChangeData} options={BOcategoryChangeData} />
              ) : (
                <div className="text-center text-gray-400">No data available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;