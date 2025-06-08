import React from 'react';

const BudgetForm = ({ budgetForm, handleBudgetForm, handleAddBudget, resetBudgetForm, availableCategories }) => (
  <div className="bg-gray-700 p-5 rounded-xl mb-5 mr-5 w-100 fade-in">
    <h3 className="text-2xl mb-3">Add Budget</h3>
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="text"
      name="name"
      value={budgetForm.name}
      placeholder="Budget Name"
      onChange={handleBudgetForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="number"
      name="amount"
      value={budgetForm.amount}
      placeholder="Budget Amount"
      onChange={handleBudgetForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="date"
      name="startDate"
      value={budgetForm.startDate}
      placeholder="Start Date"
      onChange={handleBudgetForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="date"
      name="endDate"
      value={budgetForm.endDate}
      placeholder="End Date"
      onChange={handleBudgetForm}
    />
    <select
      className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
      name="category"
      value={budgetForm.category}
      onChange={handleBudgetForm}
    >
      <option value="" disabled>
        Select Category
      </option>
      {availableCategories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
    <button
      className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3 scale-on-hover"
      onClick={handleAddBudget}
    >
      Save Budget
    </button>
    <button
      className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
      onClick={resetBudgetForm}
    >
      Cancel
    </button>
  </div>
);

export default BudgetForm;
