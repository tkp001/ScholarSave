import React from 'react';

const ExpenseList = ({ expenses, filterExpenses, handleFilterExpenseChange }) => {
  return (
    <div>
      <ul className="bg-gray-700 p-2 rounded-3xl my-3">
        <div className="flex flex-row flex-wrap p-1">
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1 w-70"
            type="text"
            name="name"
            value={filterExpenses.name}
            placeholder="Search Expense Records"
            onChange={handleFilterExpenseChange}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1"
            type="date"
            name="date"
            value={filterExpenses.date}
            onChange={handleFilterExpenseChange}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1"
            type="text"
            name="category"
            value={filterExpenses.category}
            placeholder="Category"
            onChange={handleFilterExpenseChange}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20"
            type="number"
            name="amountmin"
            value={filterExpenses.amountmin}
            placeholder="$ min"
            onChange={handleFilterExpenseChange}
          />
          <input
            className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20"
            type="number"
            name="amountmax"
            value={filterExpenses.amountmax}
            placeholder="$ max"
            onChange={handleFilterExpenseChange}
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
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex flex-row justify-left w-full bg-gray-600 rounded-xl m-1 p-2"
              >
                <div className="w-100">{expense.name}</div>
                <div className="w-40">{expense.date}</div>
                <div className="w-60">{expense.category}</div>
                <div>{expense.amount}</div>
              </li>
            ))}
          </div>
        </div>
      </ul>
    </div>
  );
};

export default ExpenseList;