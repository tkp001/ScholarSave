import React from 'react';
import BudgetWidget from '../BudgetWidget';

const BudgetList = ({ budgets, getSpentAmount, handleDeleteBudget, getBudgetReminder }) => (
  <div className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container min-w-210 w-auto">
    <h3 className="text-2xl mb-3">Budgets</h3>
    <ul>
      {budgets.map((budget) => {
        const currentAmount = getSpentAmount(budget);
        const progress = (currentAmount.spent / budget.amount) * 100;
        return (
          <li key={budget.id} className="mb-3 stagger-container">
            <BudgetWidget
              budget={budget}
              handleDeleteBudget={handleDeleteBudget}
              name={budget.name}
              category={budget.category}
              budgetedAmount={budget.amount}
              spentAmount={currentAmount.spent}
              gains={currentAmount.gains}
              startDate={budget.startDate}
              endDate={budget.endDate}
              progress={progress}
            />
            {getBudgetReminder(budget, currentAmount.spent)}
          </li>
        );
      })}
    </ul>
  </div>
);

export default BudgetList;
