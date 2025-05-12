import React from 'react';
import '../App.css';
import { FaTrash } from "react-icons/fa";


const TransactionList = ({ transactions, filterTransactions, handleFilterTransaction, handleDeleteTransaction}) => {
  return (
    <div>
      <ul className="bg-gray-700 p-2 rounded-3xl min-w-100">
        <div className="flex flex-col flex-wrap p-1">
          <div>
          <select
                className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-60 scale-on-hover"
                name="filter"
                value={filterTransactions.filter}
                onChange={handleFilterTransaction}
              >
                <option>None</option>
                <option selected>Date</option>
                <option selected>Date Range</option>
                <option selected>Amount Range</option>
            </select>
            <select
                className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-40 scale-on-hover"
                name="type"
                onChange={handleFilterTransaction}
              >
                <option>Deposit</option>
                <option selected>Withdrawl</option>
            </select>

            {true && (
              <div className='flex flex-row'>
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 w-70"
                  type="text"
                  name="name"
                  value={filterTransactions.name}
                  placeholder="Search Records"
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
              </div>
            )}

          </div>
          <div>
                  
            {filterTransactions.filter == 'Date' && (
              <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 fade-in"
              type="date"
              name="date"
              value={filterTransactions.date}
              onChange={handleFilterTransaction}
              />
            )}
            {filterTransactions.filter == 'Date Range' && (
              <>
                <input
                className="border-2 border-gray-500 rounded-xl m-1 p-1 fade-in"
                type="date"
                name="startDate"
                value={filterTransactions.startDate}
                onChange={handleFilterTransaction}
                />
                <input
                className="border-2 border-gray-500 rounded-xl m-1 p-1 fade-in"
                type="date"
                name="endDate"
                value={filterTransactions.endDate}
                onChange={handleFilterTransaction}
                />
              </>
            )}
            {filterTransactions.filter == 'Amount Range' && (
              <>
              <input
                className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20 fade-in"
                type="number"
                name="amountMin"
                value={filterTransactions.amountMin}
                placeholder="min"
                onChange={handleFilterTransaction}
                />
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20 fade-in"
                  type="number"
                  name="amountMax"
                  value={filterTransactions.amountMax}
                  placeholder="max"
                  onChange={handleFilterTransaction}
                /> 
              </>
            )}   
            {filterTransactions.filter != 'None' && filterTransactions.filter != 'Date' && (
              <select
              className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-20 fade-in"
              name="filterOrder"
              value={filterTransactions.filterOrder}
              onChange={handleFilterTransaction}
              >
              <option selected>asc</option>
              <option selected>desc</option>
              </select>
            )}
          </div>
        </div>
        <div className="flex flex-row p-1">
          <div className="w-100">Name</div>
          <div className="w-40">Date</div>
          <div className="w-60">Category</div>
          <div>Amount</div>
        </div>
        <div className="flex flex-nowrap overflow-auto no-scrollbar items-center">
          <div className="flex flex-col w-full h-60">
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                
              >
                <div className="flex flex-row justify-left w-full bg-gray-600 rounded-xl m-1 p-2 stagger-container">
                  <div className='flex w-full'>
                    <div className="w-100">{transaction.name}</div>
                    <div className="w-40 text-xs">Local: {transaction.fullDate?.toDate().toISOString()}, Timestamp: {transaction.fullDate?.toDate().toLocaleString()}</div>
                    <div className="w-60">{transaction.category}</div>
                    <div className='w-15'>${transaction.amount}</div>

                    <button onClick={() => handleDeleteTransaction(transaction.id)} className="bg-red-600 rounded-4xl px-2 ml-2 scale-on-hover">
                      <FaTrash />
                    </button>
                  </div>

                  
                </div>
                
              </li>
            ))}
          </div>
        </div>
      </ul>
    </div>
  );
};

export default TransactionList;