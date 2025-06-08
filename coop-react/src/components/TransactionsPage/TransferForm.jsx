import React from 'react';

const TransferForm = ({ transferForm, handleTransferForm, handleTransferMoney, resetTransferForm, accounts }) => (
  <div className="bg-gray-700 p-5 w-100 h-100 rounded-xl fade-in">
    <h3 className="text-2xl mb-3">Transfer Money</h3>
    <div className='w-full text-md text-center my-1 font-bold'>From</div>
    <select
      className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
      name="sourceAccount"
      value={transferForm.sourceAccount}
      onChange={handleTransferForm}
    >
      <option value="" disabled>Select Source Account</option>
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.nickname} - {account.account_number} - ${account.balance}
        </option>
      ))}
    </select>
    <div className='w-full text-md text-center my-1 font-bold'>To</div>
    <select
      className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
      name="destinationAccount"
      value={transferForm.destinationAccount}
      onChange={handleTransferForm}
    >
      <option value="" disabled>Select Destination Account</option>
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.nickname} - {account.account_number} - ${account.balance}
        </option>
      ))}
    </select>
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="date"
      name="date"
      value={transferForm.date}
      onChange={handleTransferForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="number"
      name="amount"
      value={transferForm.amount}
      placeholder="Amount"
      onChange={handleTransferForm}
    />
    <button
      className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3 scale-on-hover"
      onClick={handleTransferMoney}
    >
      Transfer Money
    </button>
    <button
      className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
      onClick={resetTransferForm}
    >
      Cancel
    </button>
  </div>
);

export default TransferForm;
