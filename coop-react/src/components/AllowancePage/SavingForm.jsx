import React from 'react';

const SavingForm = ({ savingForm, handleSavingForm, handleAddSaving, resetSavingForm }) => (
  <div className="bg-gray-700 p-5 rounded-xl mb-5 w-100 h-80 fade-in">
    <h3 className="text-2xl mb-3">Add Saving</h3>
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="text"
      name="name"
      value={savingForm.name}
      placeholder="Saving Name"
      onChange={handleSavingForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="number"
      name="amount"
      value={savingForm.amount}
      placeholder="Goal Amount"
      onChange={handleSavingForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="date"
      name="startDate"
      value={savingForm.startDate}
      placeholder="Start Date"
      onChange={handleSavingForm}
    />
    <input
      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
      type="date"
      name="endDate"
      value={savingForm.endDate}
      placeholder="End Date"
      onChange={handleSavingForm}
    />
    <button
      className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3 scale-on-hover"
      onClick={handleAddSaving}
    >
      Save Saving
    </button>
    <button
      className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
      onClick={resetSavingForm}
    >
      Cancel
    </button>
  </div>
);

export default SavingForm;
