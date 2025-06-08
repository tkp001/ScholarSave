import React from 'react';
import SavingWidget from '../SavingWidget';

const SavingList = ({ savings, getSavedAmount, handleDeleteSaving, getSavingReminder }) => (
  <div className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container min-w-210 w-auto">
    <h3 className="text-2xl mb-3">Savings</h3>
    <ul>
      {savings.map((saving) => {
        const savedAmount = getSavedAmount(saving);
        const progress = (savedAmount / saving.amount) * 100;
        return (
          <li key={saving.id} className="mb-3 stagger-container">
            <SavingWidget
              saving={saving}
              name={saving.name}
              goalAmount={saving.amount}
              startDate={saving.startDate}
              endDate={saving.endDate}
              savedAmount={savedAmount}
              progress={progress}
              handleDeleteSaving={() => handleDeleteSaving(saving.id)}
            />
            {getSavingReminder(saving, savedAmount)}
          </li>
        );
      })}
    </ul>
  </div>
);

export default SavingList;
