import React from 'react';

const TransactionList = ({ transactions, filterTransactions, handleFilterTransaction }) => {
  return (
    <div>
      <ul className="bg-gray-700 p-2 rounded-3xl my-3 min-w-100">
        <div className="flex flex-row flex-wrap p-1">
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1 w-70"
            type="text"
            name="name"
            value={filterTransactions.name}
            placeholder="Search Records"
            onChange={handleFilterTransaction}
          />
          <select
              className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-40"
              name="type"
              onChange={handleFilterTransaction}
            >
              <option>Income</option>
              <option selected>Expenses</option>
          </select>
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1"
            type="date"
            name="date"
            value={filterTransactions.date}
            onChange={handleFilterTransaction}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1"
            type="text"
            name="category"
            value={filterTransactions.category}
            placeholder="Category"
            onChange={handleFilterTransaction}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20"
            type="number"
            name="amountmin"
            value={filterTransactions.amountmin}
            placeholder="$ Min"
            onChange={handleFilterTransaction}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20"
            type="number"
            name="amountmax"
            value={filterTransactions.amountmax}
            placeholder="$ Max"
            onChange={handleFilterTransaction}
          />
        </div>
        <div className="flex flex-row p-1">
          <div className="w-100">Name</div>
          <div className="w-40">Date</div>
          <div className="w-60">Category</div>
          <div>Amount</div>
        </div>
        <div className="flex flex-nowrap overflow-auto no-scrollbar items-center">
          <div className="flex flex-col w-full h-30">
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-row justify-left w-full bg-gray-600 rounded-xl m-1 p-2"
              >
                <div className="w-100">{transaction.name}</div>
                <div className="w-40">{transaction.date}</div>
                <div className="w-60">{transaction.category}</div>
                <div>${transaction.amount}</div>
              </li>
            ))}
          </div>
        </div>
      </ul>
    </div>
  );
};

export default TransactionList;