import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';

import BudgetWidget from '../components/BudgetWidget';
import SavingWidget from '../components/SavingWidget';
import AccountViewer from '../components/AccountViewer';

const AllowancePage = () => {
  const { user } = useContext(UserContext);
  const {accounts} = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {fetchAccounts} = useContext(UserContext);

  const [addBudget, setAddBudget] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetForm, setBudgetForm] = useState({
    name: "",
    category: "",
    type: "Budget",
    amount: "",
    year: "",
    month: "",
    user_id: user.uid,
  });

  const handleBudgetForm = (e) => {
    const { name, value } = e.target;
    setBudgetForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      }));
      console.log(budgetForm);
    };

  // Extra function
  function getAvailableYearsAndMonths(categoryBreakdown) {
    if (!categoryBreakdown) return { years: [], months: [] };
  
    const years = Object.keys(categoryBreakdown);
    const months = years.reduce((acc, year) => {
      const yearMonths = Object.keys(categoryBreakdown[year]);
      return [...acc, ...yearMonths.map((month) => ({ year, month }))];
    }, []);
  
    return { years, months };
  }

  async function handleAddBudget() {
    if (
      !budgetForm.name ||
      !budgetForm.category ||
      !budgetForm.amount ||
      !budgetForm.year ||
      !budgetForm.month
    ) {
      alert("Please fill out all fields.");
      return;
    }
  
    try {
      const budgetsRef = collection(db, "allowances");
      await addDoc(budgetsRef, {
        ...budgetForm,   
        account_number: viewedAccount.account_number,
      });
  
      alert("Budget added successfully!");
      setAddBudget(false);
      // Reset budget form
      fetchBudgets();
    } catch (error) {
      console.error("Error adding budget:", error);
      alert("An error occurred while adding the budget.");
    }
  }

  async function fetchBudgets() {
    try {
      const budgetsRef = collection(db, "allowances");
  
      const q = query(
        budgetsRef,
        where("user_id", "==", user.uid),
        where("account_number", "==", viewedAccount.account_number),
        where("type", "==", "Budget")
      );
  
      const querySnapshot = await getDocs(q);
  
      const budgets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setBudgets(budgets);
      console.log("Fetched budgets:", budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  }

  function getSpentAmount(budget) {
    const { year, month, category } = budget;
  
    // Access catergory
    const breakdown = viewedAccount?.categoryBreakdown?.[year]?.[month] || {};
  
    // Calculate spent amount
    const spentAmount = breakdown[category]*-1 || 0;

    // Separate gains and spending
    return {
      spent: spentAmount > 0 ? spentAmount : 0,
      gains: spentAmount < 0 ? Math.abs(spentAmount) : 0,
    }
  }

  useEffect(() => {
    if (viewedAccount) {
      fetchBudgets();
      fetchSavings();
    }
  }, [viewedAccount]);

  async function handleDeleteBudget(budgetId) {
    try {
      const budgetDocRef = doc(db, "allowances", budgetId);
      await deleteDoc(budgetDocRef);
      alert("Budget deleted successfully!");
  
      // Refresh the budgets list
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("An error occurred while deleting the budget.");
    }
  }

  async function fetchSavings() {
    try {
      const savingsRef = collection(db, "allowances");
  
      const q = query(
        savingsRef,
        where("user_id", "==", user.uid),
        where("account_number", "==", viewedAccount.account_number),
        where("type", "==", "Saving")
      );
  
      const querySnapshot = await getDocs(q);
  
      const savings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setSavings(savings);
      console.log("Fetched savings:", savings);
    } catch (error) {
      console.error("Error fetching savings:", error);
    }
  }




  // Savings

  const [savings, setSavings] = useState([]);
  const [addSaving, setAddSaving] = useState(false);
  const [savingForm, setSavingForm] = useState({
    name: "",
    category: "",
    type: "Saving",
    amount: "", 
    year: "",
    month: "",
    user_id: user.uid,
    account_number: viewedAccount?.account_number,
  });

  const handleSavingForm = (e) => {
    const { name, value } = e.target;
    setSavingForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  async function handleAddSaving() {
    if (!savingForm.name || !savingForm.amount) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const savingsRef = collection(db, "allowances");
      await addDoc(savingsRef, {
        ...savingForm,   
        account_number: viewedAccount.account_number,
        category: savingForm.name,
      });
      alert("Saving added successfully!");
      setAddSaving(false);
      fetchSavings();
    } catch (error) {
      console.error("Error adding saving:", error);
      alert("An error occurred while adding the saving.");
    }
  }

  function getSavedAmount(saving) {
    const { year, month, name } = saving;
  
    const breakdown = viewedAccount?.categoryBreakdown?.[year]?.[month] || {};
  
    const savedAmount = breakdown[name] || 0;
  
    return savedAmount;
  }

  async function handleDeleteSaving(savingId) {
    try {
      const savingDocRef = doc(db, "allowances", savingId); 
      await deleteDoc(savingDocRef); 
      alert("Saving deleted successfully!");
  
      fetchSavings();
    } catch (error) {
      console.error("Error deleting saving:", error);
      alert("An error occurred while deleting the saving.");
    }
  }

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
        <AccountViewer />

        {viewedAccount && (
          <>
          {budgets.length > 0 ? (
          <div className="bg-gray-700 p-5 rounded-xl mt-5">
            <h3 className="text-2xl mb-3">Budgets</h3>
            <ul>
              {budgets.map((budget) => {
                const currentAmount = getSpentAmount(budget); // Calculate the spent amount
                const progress = (currentAmount.spent / budget.amount) * 100; // Calculate progress as a percentage

                return (
                  <li key={budget.id} className="mb-3">
                    <BudgetWidget
                      budget={budget}
                      handleDeleteBudget={handleDeleteBudget}
                      name={budget.name}
                      category={budget.category}
                      budgetedAmount={budget.amount}
                      spentAmount={currentAmount.spent}
                      gains={currentAmount.gains}
                      monthYear={`${new Date(0, parseInt(budget.month) - 1).toLocaleString(
                        "default",
                        { month: "long" }
                      )} ${budget.year}`}
                      progress={progress}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-700 p-5 rounded-xl mt-5">
            <h3 className="text-2xl mb-3">No Budgets Found</h3>
            <p>You haven't added any budgets yet.</p>
          </div>
        )}

        {savings.length > 0 ? (
          <div className="bg-gray-700 p-5 rounded-xl mt-5">
            <h3 className="text-2xl mb-3">Savings</h3>
            <ul>
              {savings.map((saving) => {
                const savedAmount = getSavedAmount(saving); // Get the saved amount
                const progress = (savedAmount / saving.amount) * 100; // Calculate progress as a percentage

                return (
                  <li key={saving.id} className="mb-3">
                    <SavingWidget
                      saving={saving}
                      name={saving.name}
                      goalAmount={saving.amount}
                      savedAmount={savedAmount}
                      progress={progress}
                      monthYear={`${new Date(0, parseInt(saving.month) - 1).toLocaleString(
                        "default",
                        { month: "long" }
                      )} ${saving.year}`}
                      handleDeleteSaving={() => handleDeleteSaving(saving.id)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-700 p-5 rounded-xl mt-5">
            <h3 className="text-2xl mb-3">No Savings Found</h3>
            <p>You haven't added any savings yet.</p>
          </div>
        )}



          <div className="flex flex-row">
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 mr-3 my-6"
              onClick={() => setAddBudget(!addBudget)}
            >
              Add Budget
            </button>
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 mr-3 my-6"
              onClick={() => setAddSaving(!addSaving)}
            >
              Add Saving
            </button>
          </div>

          <div className="flex flex-row">
          {addBudget && (
            <div className="bg-gray-700 p-5 rounded-xl mb-5 mr-5 w-100">
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
              <select
                className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                name="year"
                value={budgetForm.year}
                onChange={handleBudgetForm}
              >
                <option value="" disabled>
                  Select Year
                </option>
                {Object.keys(viewedAccount?.categoryBreakdown || {}).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                name="month"
                value={budgetForm.month}
                onChange={handleBudgetForm}
              >
                <option value="" disabled>
                  Select Month
                </option>
                {Object.keys(viewedAccount?.categoryBreakdown?.[budgetForm.year] || {}).map(
                  (month) => (
                    <option key={month} value={month}>
                      {new Date(0, parseInt(month) - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  )
                )}
              </select>
              
              <select
                className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                name="category"
                value={budgetForm.category}
                onChange={handleBudgetForm}
              >
                <option value="" disabled>
                  Select Category
                </option>
                {Object.keys(
                  viewedAccount?.categoryBreakdown?.[budgetForm.year]?.[budgetForm.month] || {}
                ).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3"
                onClick={handleAddBudget}
              >
                Save Budget
              </button>
              <button
                className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
                onClick={() => setAddBudget(!addBudget)}
              >
                Cancel
              </button>
            </div>
          )}

          {addSaving && (
            <div className="bg-gray-700 p-5 rounded-xl mb-5 w-100 h-80">
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
                name="date"
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const year = selectedDate.getFullYear();
                  const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // Ensure month is 2 digits
                  setSavingForm((prevFormData) => ({
                    ...prevFormData,
                    year,
                    month,
                  }));
                }}
              />
              <button
                className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3"
                onClick={handleAddSaving}
              >
                Save Saving
              </button>
              <button
                className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
                onClick={() => setAddSaving(false)}
              >
                Cancel
              </button>
            </div>
          )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
export default AllowancePage