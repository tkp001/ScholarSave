import React from 'react';

const TransactionForm = ({ transactionForm, handleTransactionForm, handleAddTransaction, resetTransactionForm, getCategoriesForSelectedDate }) => (
  <div className="bg-gray-700 p-5 w-100 h-115 rounded-xl mr-4 fade-in">
    <h3 className="text-2xl mb-3">Add New Transaction</h3>
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="text"
      name="name"
      value={transactionForm.name}
      placeholder="Transaction Name"
      onChange={handleTransactionForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="date"
      name="date"
      value={transactionForm.date}
      onChange={handleTransactionForm}
    />
    <select
      className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
      name="category"
      value={transactionForm.category}
      onChange={handleTransactionForm}
    >
      <option value="Custom Category">Custom Category</option>
      <option value="" disabled>--Default Categories--</option>
      <option value="Salary/Income">Salary/Income</option>
      <option value="Groceries">Groceries</option>
      <option value="Rent/Mortgage">Rent/Mortgage</option>
      <option value="Transportation">Transportation</option>
      <option value="Dining/Restaurant">Dining/Restaurant</option>
      <option value="Utilities">Utilities</option>
      <option value="Shopping">Shopping</option>
      <option value="Entertainment">Entertainment</option>
      <option value="Health & Fitness">Health & Fitness</option>
      <option value="Loan/Credit Payments">Loan/Credit Payments</option>
      <option value="Investment">Investment</option>
      <option value="" disabled>--Categories This Month--</option>
      {getCategoriesForSelectedDate().map((category) => (
        <option key={category} value={category}>{category}</option>
      ))}
    </select>
    {transactionForm.customCategory && (
      <input
        className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
        type="text"
        name="customCategory"
        value={transactionForm.category || ""}
        placeholder="Enter Custom Category"
        onChange={e => handleTransactionForm({ target: { name: 'category', value: e.target.value } })}
      />
    )}
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="number"
      name="amount"
      value={transactionForm.amount}
      placeholder="Amount"
      onChange={handleTransactionForm}
    />
    <p className="text-md my-2">+ for Deposit</p>
    <p className="text-md my-2">- for Withdrawl</p>
    <p className="text-md my-2">You are performing "{transactionForm.type}"</p>
    <button
      className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3 scale-on-hover"
      onClick={handleAddTransaction}
    >
      Save Transaction
    </button>
    <button
      className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
      onClick={resetTransactionForm}
    >
      Cancel
    </button>
  </div>
);

export default TransactionForm;
