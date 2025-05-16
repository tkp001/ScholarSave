import React, { useEffect, useState } from 'react';
import '../App.css';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';

import BudgetWidget from '../components/BudgetWidget';
import SavingWidget from '../components/SavingWidget';
import AccountViewer from '../components/AccountViewer';
import { toast } from 'react-toastify';

const AllowancePage = () => {
  const { user } = useContext(UserContext);
  const {accounts} = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {fetchAccounts} = useContext(UserContext);
  const {toastMessage} = useContext(UserContext);
  const [animateKey, setAnimateKey] = useState(0);
  const [addBudget, setAddBudget] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetForm, setBudgetForm] = useState({
    name: "",
    category: "",
    type: "Budget",
    amount: "",
    startDate: "",
    endDate: "",
    user_id: user.uid,
  });

  function resetBudgetForm() {
    setAddBudget(!addBudget);
    setBudgetForm({
      name: "",
      category: "",
      type: "Budget",
      amount: "",
      startDate: "",
      endDate: "",
      user_id: user.uid,
    });
  }

  const [availableCategories, setAvailableCategories] = useState([]);

  const handleBudgetForm = (e) => {
    const { name, value } = e.target;
    setBudgetForm((prevFormData) => {
      const updatedForm = { ...prevFormData, [name]: value };

      // Only update categories if startDate or endDate changed
      if (
        (name === "startDate" || name === "endDate") &&
        updatedForm.startDate &&
        updatedForm.endDate
      ) {
        const startDate = new Date(updatedForm.startDate);
        const endDate = new Date(updatedForm.endDate);
        if (startDate <= endDate) {
          const filteredCategories = getCategoriesWithinDateRange(startDate, endDate);
          setAvailableCategories(filteredCategories);
        }
      }

      return updatedForm;
    });
  };

  function getCategoriesWithinDateRange(startDate, endDate) {
    if (!viewedAccount?.categoryBreakdown) return [];
  
    const categories = [];
    const breakdown = viewedAccount.categoryBreakdown;
  
    Object.keys(breakdown).forEach((year) => {
      Object.keys(breakdown[year]).forEach((month) => {
        const date = new Date(`${year}-${month}-01`); // Create a date from year and month
        if (date >= startDate && date <= endDate) {
          Object.keys(breakdown[year][month]).forEach((category) => {
            if (!categories.includes(category)) {
              categories.push(category);
            }
          });
        }
      });
    });
  
    return categories;
  }

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
  if (!budgetForm.name || !budgetForm.category || !budgetForm.amount || !budgetForm.startDate || !budgetForm.endDate) {
    toastMessage("Please fill out all fields.", "warning");
    return;
  }

  try {
    const budgetsRef = collection(db, "allowances");
    await addDoc(budgetsRef, {
      ...budgetForm,
      startDate: budgetForm.startDate,
      endDate: budgetForm.endDate,
      account_number: viewedAccount.account_number,
    });

    toastMessage("Budget added successfully!", "success");
    setAddBudget(false);
    fetchBudgets();
  } catch (error) {
    console.error("Error adding budget:", error);
    toastMessage("An error occurred while adding the budget.", "error");
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
    const { category, startDate, endDate } = budget;
  
    if (!viewedAccount?.categoryBreakdown) return { spent: 0, gains: 0 };
  
    const breakdown = viewedAccount.categoryBreakdown;
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    let totalSpent = 0;
  
    // Iterate over the categoryBreakdown
    Object.keys(breakdown).forEach((year) => {
      Object.keys(breakdown[year]).forEach((month) => {
        const date = new Date(`${year}-${month}-01`); // Create a date from year and month
        if (date >= start && date <= end) {
          const monthlyBreakdown = breakdown[year][month];
          if (monthlyBreakdown[category]) {
            totalSpent += monthlyBreakdown[category];
          }
        }
      });
    });
  
    // Separate gains and spending
    return {
      spent: totalSpent < 0 ? Math.abs(totalSpent) : 0, // Spending is negative
      gains: totalSpent > 0 ? totalSpent : 0, // Gains are positive
    };
  }

  useEffect(() => {
    if (viewedAccount) {
      fetchBudgets();
      fetchSavings();
      setAnimateKey((prevKey) => prevKey + 1); 
    }
  }, [viewedAccount]);

  async function handleDeleteBudget(budgetId) {
    try {
      const budgetDocRef = doc(db, "allowances", budgetId);
      await deleteDoc(budgetDocRef);
      toastMessage("Budget deleted successfully!", "success");
  
      // Refresh the budgets list
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      toastMessage("An error occurred while deleting the budget.", "error");
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
    startDate: "",
    endDate: "",
    user_id: user.uid,
    account_number: viewedAccount?.account_number,
  });

  function resetSavingForm() {
    setAddSaving(!addSaving);
    setSavingForm({
      name: "",
      category: "",
      type: "Saving",
      amount: "",
      startDate: "",
      endDate: "",
      user_id: user.uid,
      account_number: viewedAccount?.account_number,
    });
  }

  const handleSavingForm = (e) => {
    const { name, value } = e.target;
    setSavingForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };


  // async function handleAddSaving() {
  //   if (!savingForm.name || !savingForm.amount) {
  //     alert("Please fill out all fields.");
  //     return;
  //   }
  
  //   try {
  //     const savingsRef = collection(db, "allowances");
  
  //     // Add the saving to Firestore
  //     await addDoc(savingsRef, {
  //       ...savingForm,
  //       account_number: viewedAccount.account_number,
  //       category: savingForm.name,
  //     });
  
  //     // Update the categoryBreakdown in the account document
  //     const accountDocRef = doc(db, "accounts", viewedAccount.id);
  //     const accountSnapshot = await getDoc(accountDocRef);
  
  //     if (accountSnapshot.exists()) {
  //       const accountData = accountSnapshot.data();
  //       const { year, month, name } = savingForm;
  
  //       // Initialize or update the categoryBreakdown
  //       const categoryBreakdown = accountData.categoryBreakdown || {};
  //       if (!categoryBreakdown[year]) {
  //         categoryBreakdown[year] = {};
  //       }
  //       if (!categoryBreakdown[year][month]) {
  //         categoryBreakdown[year][month] = {};
  //       }
  //       if (!categoryBreakdown[year][month][name]) {
  //         categoryBreakdown[year][month][name] = 0; // Add 0 to the category
  //       }
  
  //       // Update the account document in Firestore
  //       await updateDoc(accountDocRef, { categoryBreakdown });
  //     }
  
  //     alert("Saving added successfully!");
  //     setAddSaving(false);
  //     fetchSavings();
  //   } catch (error) {
  //     console.error("Error adding saving:", error);
  //     alert("An error occurred while adding the saving.");
  //   }
  // }

  async function handleAddSaving() {
    if (!savingForm.name || !savingForm.amount || !savingForm.startDate || !savingForm.endDate) {
      toastMessage("Please fill out all fields.", "warning");
      return;
    }
  
    try {
      const savingsRef = collection(db, "allowances");
  
      // Add the saving to Firestore
      await addDoc(savingsRef, {
        ...savingForm,
        startDate: savingForm.startDate,
        endDate: savingForm.endDate,
        account_number: viewedAccount.account_number,
        category: savingForm.name,
      });
  
      // Update the categoryBreakdown in the account document
      const accountDocRef = doc(db, "accounts", viewedAccount.id);
      const accountSnapshot = await getDoc(accountDocRef);
  
      if (accountSnapshot.exists()) {
        const accountData = accountSnapshot.data();
        const { startDate, endDate, name } = savingForm;
  
        // Initialize or update the categoryBreakdown
        const categoryBreakdown = accountData.categoryBreakdown || {};
        const start = new Date(startDate);
        const end = new Date(endDate);
  
        // Iterate through all months in the date range
        // let current = new Date(start);
        // while (current <= end) {
        //   const year = current.getFullYear().toString();
        //   const month = (current.getMonth() + 1).toString().padStart(2, "0"); // Ensure month is 2 digits
  
        //   if (!categoryBreakdown[year]) {
        //     categoryBreakdown[year] = {};
        //   }
        //   if (!categoryBreakdown[year][month]) {
        //     categoryBreakdown[year][month] = {};
        //   }
        //   if (!categoryBreakdown[year][month][name]) {
        //     categoryBreakdown[year][month][name] = 0; // Initialize the category with 0
        //   }
  
        //   // Move to the next month
        //   current.setMonth(current.getMonth() + 1);
        // }
  
        // Update the account document in Firestore
        await updateDoc(accountDocRef, { categoryBreakdown });
      }
  
      toastMessage("Saving added successfully!", "success");
      setAddSaving(false);
      fetchSavings();
    } catch (error) {
      console.error("Error adding saving:", error);
      toastMessage("An error occurred while adding the saving.", "error");
    }
  }

  function getSavedAmount(saving) {
    const { name: category, startDate, endDate } = saving;
  
    if (!viewedAccount?.categoryBreakdown) return 0;
  
    const breakdown = viewedAccount.categoryBreakdown;
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    let totalSaved = 0;
  
    console.log("Category Breakdown:", breakdown);
    console.log("Category:", category);
    console.log("Start Date:", start);
    console.log("End Date:", end);
  
    // Iterate over the categoryBreakdown
    Object.keys(breakdown).forEach((year) => {
      if (year >= start.getFullYear() && year <= end.getFullYear()) {
        Object.keys(breakdown[year]).forEach((month) => {
          const monthStart = new Date(`${year}-${month.padStart(2, "0")}-01`); // Start of the month
          const monthEnd = new Date(monthStart); // End of the month
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(0); // Last day of the month
  
          console.log(`Checking month: ${monthStart} to ${monthEnd}`);
          if (monthStart <= end && monthEnd >= start) {
            const monthlyBreakdown = breakdown[year][month];
            if (monthlyBreakdown[category]) {
              console.log(`Adding ${monthlyBreakdown[category]} for ${year}-${month}`);
              totalSaved += monthlyBreakdown[category];
            }
          }
        });
      }
    });
  
    console.log("Total Saved:", totalSaved);
    return totalSaved;
  }

  async function handleDeleteSaving(savingId) {
    try {
      const savingDocRef = doc(db, "allowances", savingId); 
      await deleteDoc(savingDocRef); 
      toastMessage("Saving deleted successfully!", "success");
  
      fetchSavings();
    } catch (error) {
      console.error("Error deleting saving:", error);
      toastMessage("An error occurred while deleting the saving.", "error");
    }
  }

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
        <AccountViewer />
        {!viewedAccount && (
          <div className="text-xl my-2 mb-5 fade-in">Please select an account to view details.</div>
        )}

        {viewedAccount && (
          <>
          {budgets.length > 0 ? (
          <div key={animateKey} className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container min-w-210 w-auto">
            <h3 className="text-2xl mb-3">Budgets</h3>
            <ul>
              {budgets.map((budget) => {
                const currentAmount = getSpentAmount(budget); // Calculate the spent amount
                const progress = (currentAmount.spent / budget.amount) * 100; // Calculate progress as a percentage

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
                      // startDate={new Date(budget.startDate).toLocaleDateString()}
                      // endDate={new Date(budget.endDate).toLocaleDateString()}
                      progress={progress}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container">
            <h3 className="text-2xl mb-3">No Budgets Found</h3>
            <p>You haven't added any budgets yet.</p>
          </div>
        )}

        {savings.length > 0 ? (
          <div className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container min-w-210 w-auto">
            <h3 className="text-2xl mb-3">Savings</h3>
            <ul>
              {savings.map((saving) => {
                const savedAmount = getSavedAmount(saving); // Get the saved amount
                const progress = (savedAmount / saving.amount) * 100; // Calculate progress as a percentage

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
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container">
            <h3 className="text-2xl mb-3">No Savings Found</h3>
            <p>You haven't added any savings yet.</p>
          </div>
        )}



          <div className="flex flex-row">
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 mr-3 my-6 scale-on-hover"
              onClick={() => setAddBudget(!addBudget)}
            >
              Add Budget
            </button>
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 mr-3 my-6 scale-on-hover"
              onClick={() => setAddSaving(!addSaving)}
            >
              Add Saving
            </button>
          </div>

          <div className="flex flex-row">
          {addBudget && (
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
                onClick={() => resetBudgetForm()}
              >
                Cancel
              </button>
            </div>
          )}

          {addSaving && (
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
                onClick={() => resetSavingForm()}
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