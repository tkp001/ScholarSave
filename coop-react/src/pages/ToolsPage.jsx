import React, { useEffect, useState, useContext } from 'react';
import '../App.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import UserContext from '../UserContext';

const ToolsPage = () => {
  const [isContentVisible, setIsContentVisible] = useState([false, false, false]);

  const toggleContent = (i) => {
    setIsContentVisible((prevState) =>
      prevState.map((visible, index) => (index === i ? !visible : visible))
    );
  };


  return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white stagger-container'>
      <div className="flex flex-col items-center w-full h-400 p-10">
        <div className='text-5xl mb-10'>Financial Tools</div>

        <div className='flex flex-col bg-gray-700 w-200 h-fit rounded-3xl mb-5 stagger-container'>
          <div
            className='flex flex-row items-center h-12 cursor-pointer'
            onClick={() => toggleContent(0)}
          >
            <div className='text-xl ml-4 w-185 text-white'>Interest Predictions</div>
            <div className='text-4xl mb-2'>{isContentVisible[0] ? '-' : '+'}</div>
          </div>
          {isContentVisible[0] && (
            <div className='w-full h-fit rounded-b-3xl bg-gray-600 p-5'>
              <InterestPredictionsTool />
            </div>
          )}
        </div>

        <div className='flex flex-col bg-gray-700 w-200 rounded-3xl mb-5 stagger-container'>
          <div
            className='flex flex-row items-center h-12 cursor-pointer'
            onClick={() => toggleContent(1)}
          >
            <div className='text-xl ml-4 w-185 text-white'>Currency Exchange</div>
            <div className='text-4xl mb-2'>{isContentVisible[1] ? '-' : '+'}</div>
          </div>
          {isContentVisible[1] && (
            <div className='w-full rounded-b-3xl bg-gray-600 p-5'>
              <CurrencyExchangeTool />
            </div>
          )}
        </div>

        <div className='flex flex-col bg-gray-700 w-200 rounded-3xl mb-5 stagger-container'>
          <div
            className='flex flex-row items-center h-12 cursor-pointer'
            onClick={() => toggleContent(2)}
          >
            <div className='text-xl ml-4 w-185 text-white'>Repayment/Debt Strategies</div>
            <div className='text-4xl mb-2'>{isContentVisible[2] ? '-' : '+'}</div>
          </div>
          {isContentVisible[2] && (
            <div className='w-full rounded-b-3xl bg-gray-600 p-5'>
              <RepaymentStrategies />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const InterestPredictionsTool = () => {
  const {toastMessage} = useContext(UserContext);
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('1'); 
  const [calculationType, setCalculationType] = useState('compound');
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState(null);

  const calculateInterest = () => {
    const principalAmount = parseFloat(principal);
    const interestRate = parseFloat(rate) / 100;
    const timePeriod = parseFloat(time);

    if (!principalAmount || !interestRate || !timePeriod) {
      toastMessage('Please enter valid values for all fields.', 'warning');
      return;
    }

    if (calculationType === 'linear') {
      // Simple Interest
      // SI = P * r * t
      // A = P + SI
      const simpleInterest = principalAmount * interestRate * timePeriod;
      const totalAmount = principalAmount + simpleInterest;

      const labels = Array.from({ length: timePeriod + 1 }, (_, i) => i); // Years: 0 to timePeriod
      const data = labels.map((year) => principalAmount + principalAmount * interestRate * year);

      setResult({
        interest: simpleInterest.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Total Amount Over Time (Simple Interest)',
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      });
    } else if (calculationType === 'compound') {
      // Compound Interest
      // A = P (1 + r/n)^(nt)
      const frequency = parseInt(compoundFrequency);
      const labels = Array.from({ length: timePeriod + 1 }, (_, i) => i);
      const data = labels.map((year) =>
        principalAmount * Math.pow(1 + interestRate / frequency, frequency * year)
      );

      const totalAmount = data[data.length - 1];
      const compoundInterest = totalAmount - principalAmount;

      setResult({
        interest: compoundInterest.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Total Amount Over Time (Compound Interest)',
            data,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      });
    }
  };

  return (
    <div>
      <h3 className='text-2xl mb-3'>Interest Predictions Tool</h3>
      <div className='flex flex-col'>
        <input
          type='number'
          placeholder='Principal Amount'
          className='border-2 border-gray-500 rounded-xl m-1 p-1'
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />
        <input
          type='number'
          placeholder='Annual Interest Rate (%)'
          className='border-2 border-gray-500 rounded-xl m-1 p-1'
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <input
          type='number'
          placeholder='Time Period (Years)'
          className='border-2 border-gray-500 rounded-xl m-1 p-1'
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <select
          className='border-2 border-gray-500 bg-gray-600 rounded-xl m-1 p-1'
          value={calculationType}
          onChange={(e) => setCalculationType(e.target.value)}
        >
          <option value="linear">Simple Interest</option>
          <option value="compound">Compound Interest</option>
        </select>

        {/* Compound Frequency Selector (only compound interest) */}
        {calculationType === 'compound' && (
          <select
            className='border-2 border-gray-500 bg-gray-600 rounded-xl m-1 p-1'
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(e.target.value)}
          >
            <option value="1">Yearly</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
        )}

        <button
          className='w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 scale-on-hover'
          onClick={calculateInterest}
        >
          Calculate {calculationType === 'linear' ? 'Simple Interest' : 'Compound Interest'}
        </button>

        {result && (
          <div className='mt-3'>
            <p>{calculationType === 'linear' ? 'Simple Interest' : 'Compound Interest'}: ${result.interest}</p>
            <p>Total Amount: ${result.totalAmount}</p>
          </div>
        )}

        {chartData && (
          <div className='mt-5'>
            <h4 className='text-xl'>
              {calculationType === 'linear'
                ? 'Simple Interest Growth Over Time'
                : 'Compound Interest Growth Over Time'}
            </h4>
            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

const CurrencyExchangeTool = () => {
  const {toastMessage} = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('CAD'); // Default
  const [toCurrency, setToCurrency] = useState('USD'); // Default
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const apiKey = import.meta.env.VITE_API_EXCHANGERATE

  const fetchExchangeRate = async () => {
    console.log(fromCurrency, toCurrency, amount)
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
      );
      const data = await response.json();

      if (data.result === 'success') {
        const rate = data.conversion_rates[toCurrency];
        setExchangeRate(rate);

        // Calculate converted amount
        const converted = parseFloat(amount) * rate;
        setConvertedAmount(converted.toFixed(2));
      } else {
        toastMessage('Error fetching exchange rate', 'error');
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      toastMessage('Error fetching exchange rate', 'error');
    }
  };

  return (
    <div>
      <h3 className="text-2xl mb-3">Currency Exchange Tool</h3>
      <div className="flex flex-col">
        <input
          type="number"
          placeholder="Amount"
          className="border-2 border-gray-500 rounded-xl m-1 p-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Add More currency options later (view api output for regions) */}
        <select
          className="border-2 border-gray-500 bg-gray-600 rounded-xl m-1 p-1"
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>

        </select>
        <select
          className="border-2 border-gray-500 bg-gray-600 rounded-xl m-1 p-1"
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
        >
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>

        </select>
        <button
          className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 scale-on-hover"
          onClick={fetchExchangeRate}
        >
          Convert
        </button>

        {exchangeRate && (
          <div className="mt-3">
            <p>Exchange Rate: 1 {fromCurrency} = {exchangeRate} {toCurrency}</p>
            <p>Converted Amount: {toCurrency} {convertedAmount}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RepaymentStrategies = () => {
  const {toastMessage} = useContext(UserContext);
  const [debtAmount, setDebtAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [repaymentInterval, setRepaymentInterval] = useState('monthly');
  const [repaymentDuration, setRepaymentDuration] = useState('');
  const [repaymentPlan, setRepaymentPlan] = useState(null);

  const calculateRepaymentPlan = () => {
    const principal = parseFloat(debtAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const durationInMonths = parseInt(repaymentDuration);

    if (!principal || !annualRate || !durationInMonths) {
      toastMessage('Please enter valid values for all fields.', 'warning');
      return;
    }

    // Determine the number of payments per year based on the interval
    const paymentsPerYear = repaymentInterval === 'monthly' ? 12 : 26; // 12 for monthly, 26 for bi-weekly
    const totalPayments = durationInMonths / (12 / paymentsPerYear);
    const periodicRate = annualRate / paymentsPerYear;

    // Formula
    // Payment = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
    const payment =
      (principal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);

    // Calculate total interest paid
    const totalPaid = payment * totalPayments;
    const totalInterest = totalPaid - principal;

    setRepaymentPlan({
      payment: payment.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    });
  };

  return (
    <div>
      <h3 className="text-2xl mb-3">Repayment Strategies</h3>
      <div className="flex flex-col">
        <input
          type="number"
          placeholder="Debt Amount"
          className="border-2 border-gray-500 rounded-xl m-1 p-1"
          value={debtAmount}
          onChange={(e) => setDebtAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Annual Interest Rate (%)"
          className="border-2 border-gray-500 rounded-xl m-1 p-1"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
        <select
          className="border-2 border-gray-500 bg-gray-600 rounded-xl m-1 p-1"
          value={repaymentInterval}
          onChange={(e) => setRepaymentInterval(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="bi-weekly">Bi-Weekly</option>
        </select>
        <input
          type="number"
          placeholder="Repayment Duration (Months)"
          className="border-2 border-gray-500 rounded-xl m-1 p-1"
          value={repaymentDuration}
          onChange={(e) => setRepaymentDuration(e.target.value)}
        />
        <button
          className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 scale-on-hover"
          onClick={calculateRepaymentPlan}
        >
          Calculate Plan
        </button>

        {repaymentPlan && (
          <div className="mt-3">
            <p>Periodic Payment: ${repaymentPlan.payment}</p>
            <p>Total Paid: ${repaymentPlan.totalPaid}</p>
            <p>Total Interest Paid: ${repaymentPlan.totalInterest}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;