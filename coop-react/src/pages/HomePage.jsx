import React, { useContext, useEffect, useState, useRef } from 'react'; 
import UserContext from '../UserContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { GoogleGenAI } from "@google/genai";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto'; // MUST INCLUDE TO DESTROY UPON UNMOUNTING
// import { Chart } from 'chart.js/auto';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HomePage = () => {
  const { user } = useContext(UserContext);
  const [accounts, setAccounts] = useState([]);
  const [viewedAccount, setViewedAccount] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);

  const api = import.meta.env.VITE_API_GOOGLE_GENAI
  const ai = new GoogleGenAI({ apiKey: api });

  function fetchAccounts() {
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('user_id', '==', user.uid));
    getDocs(q)
      .then((querySnapshot) => {
        const accounts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAccounts(accounts);
        console.log(accounts);
      })
      .catch((error) => {
        console.error('Error fetching accounts: ', error);
      });
  }

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

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle account selection
  function changeViewedAccount(e) {
    const selectedAccountId = e.target.value;
    const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
    setViewedAccount(selectedAccount);
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
  
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      temperature: 0.2,
      contents: `Provide summarized in 100 words or less insights or suggestions based on the following user data:\n\n${formattedData}\n\n Add a disclamier that you are not a financial advisor.`,
    });
  
    // Log the response
    console.log("AI Insights Response:", response.text);
    setAiInsight(response.text);
  }
  
  useEffect(() => {
    // Check if all required data is available
    setAiInsight(null); // Reset when account changes
    
    if (
      viewedAccount &&
      monthlyBalance.length > 0 &&
      top5Income.length > 0 &&
      top5Spending.length > 0 &&
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
    }
  }, [viewedAccount]);

  return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
      <div className="flex flex-col w-full h-400 p-10">
        <div className='text-3xl my-3'>Welcome {user.displayName}</div>
        <div className="text-2xl">Choose An Account:</div>
        <>
          <select
            className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 mb-10 p-1 w-100"
            name="accountSelector"
            onChange={(e) => changeViewedAccount(e)}
          >
            <option value="" disabled selected>
              Select an account
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.nickname} - {account.account_number} - ${account.balance}
              </option>
            ))}
          </select>
        </>

        {viewedAccount && (
          <>
            {aiInsight && (
              <div className='rounded-3xl flex flex-col bg-gray-700 w-200 h-fit py-5 p-3 mb-2'>
                <div className='text-xl mb-2'>ScholarSave Insights AI</div>
                <div className='text-md'>{aiInsight}</div>
              </div>
            )}
            <div className='flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5'>   
              <div className='text-xl mb-2'>Monthly Balance</div>
              <Bar data={BDMonthlyBalances} options={BOMonthlyBalanceChange} />
            </div>

            <div className='flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5'>   
              <div className='text-xl mb-2'>Monthly Balance Change</div>
              <Bar data={BDMonthlyBalanceChange} options={BOMonthlyBalanceChange} />
            </div>

            <div className='flex flex-row my-2'>
              <div className='flex flex-col bg-gray-700 w-100 h-fit rounded-3xl mr-2 p-5'>
                <div className='text-xl mb-2'>Top 5 Spending</div>
                <Pie data={spendingData} />
              </div>

              <div className='flex flex-col bg-gray-700 w-100 h-fit rounded-3xl p-5'>
                <div className='text-xl mb-2'>Top 5 Income</div>
                <Pie data={incomeData} />
              </div>
            </div>

            <div className='flex flex-col bg-gray-700 w-200 h-fit rounded-3xl my-2 p-5'>
              <div className='text-xl mb-2'>Category Change Per Month</div>
              <Bar
                data={categoryChangeData}
                options={BOcategoryChangeData}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;