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
import BudgetForm from '../components/AllowancePage/BudgetForm';
import SavingForm from '../components/AllowancePage/SavingForm';
import BudgetList from '../components/AllowancePage/BudgetList';
import SavingList from '../components/AllowancePage/SavingList';

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

  /**
   * Reset the budget form to its initial state and toggle the addBudget modal.
   */
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

  /**
   * Handle changes to the budget form fields and update available categories if dates change.
   * @param {Object} e - The event object from the input change.
   */
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

  /**
   * Get all categories present in the account breakdown within a date range.
   * @param {Date} startDate - The start date of the range.
   * @param {Date} endDate - The end date of the range.
   * @returns {string[]} Array of category names.
   */
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

  /**
   * Get all available years and months from the category breakdown.
   * @param {Object} categoryBreakdown - The account's category breakdown object.
   * @returns {Object} Object with arrays of years and months.
   */
  function getAvailableYearsAndMonths(categoryBreakdown) {
    if (!categoryBreakdown) return { years: [], months: [] };
  
    const years = Object.keys(categoryBreakdown);
    const months = years.reduce((acc, year) => {
      const yearMonths = Object.keys(categoryBreakdown[year]);
      return [...acc, ...yearMonths.map((month) => ({ year, month }))];
    }, []);
  
    return { years, months };
  }

  /**
   * Add a new budget for the viewed account. Validates input and updates Firestore.
   */
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

  /**
   * Fetch all budgets for the current user and viewed account from Firestore.
   */
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

  /**
   * Calculate the total spent and gains for a given budget.
   * @param {Object} budget - The budget object.
   * @returns {Object} Object with spent and gains values.
   */
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

  /**
   * Fetch budgets and savings when the viewed account changes.
   */
  useEffect(() => {
    if (viewedAccount) {
      fetchBudgets();
      fetchSavings();
      setAnimateKey((prevKey) => prevKey + 1); 
    }
  }, [viewedAccount]);

  /**
   * Delete a budget by its Firestore document ID and refresh the list.
   * @param {string} budgetId - The Firestore document ID of the budget.
   */
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

  /**
   * Fetch all savings for the current user and viewed account from Firestore.
   */
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

  /**
   * Reset the saving form to its initial state and toggle the addSaving modal.
   */
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

  /**
   * Handle changes to the saving form fields.
   * @param {Object} e - The event object from the input change.
   */
  const handleSavingForm = (e) => {
    const { name, value } = e.target;
    setSavingForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * Add a new saving for the viewed account. Validates input and updates Firestore.
   */
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

  /**
   * Calculate the total saved amount for a given saving goal.
   * @param {Object} saving - The saving object.
   * @returns {number} The total saved amount.
   */
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

  /**
   * Delete a saving by its Firestore document ID and refresh the list.
   * @param {string} savingId - The Firestore document ID of the saving.
   */
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

  /**
   * Get a reminder message for a budget based on time left and spending.
   * @param {Object} budget - The budget object.
   * @param {number} spentAmount - The amount spent so far.
   * @returns {JSX.Element|null} Reminder message or null.
   */
  function getBudgetReminder(budget, spentAmount) {
    const end = new Date(budget.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (spentAmount > budget.amount) {
      return <div className="text-red-400 text-sm">⚠️ You have overspent this budget!</div>;
    }
    if (daysLeft <= 3 && daysLeft >= 0) {
      return <div className="text-yellow-300 text-sm">⏰ Only {daysLeft} day(s) left for this budget!</div>;
    }
    return null;
  }

  /**
   * Get a reminder message for a saving goal based on time left and progress.
   * @param {Object} saving - The saving object.
   * @param {number} savedAmount - The amount saved so far.
   * @returns {JSX.Element|null} Reminder message or null.
   */
  function getSavingReminder(saving, savedAmount) {
    const end = new Date(saving.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (savedAmount < saving.amount && daysLeft <= 3 && daysLeft >= 0) {
      return <div className="text-yellow-300 text-sm">⏰ Only {daysLeft} day(s) left to reach your saving goal!</div>;
    }
    if (savedAmount >= saving.amount) {
      return <div className="text-green-400 text-sm">🎉 Saving goal reached!</div>;
    }
    return null;
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
            <BudgetList
              budgets={budgets}
              getSpentAmount={getSpentAmount}
              handleDeleteBudget={handleDeleteBudget}
              getBudgetReminder={getBudgetReminder}
            />
          ) : (
            <div className="bg-gray-700 p-5 rounded-xl mt-5 stagger-container">
              <h3 className="text-2xl mb-3">No Budgets Found</h3>
              <p>You haven't added any budgets yet.</p>
            </div>
          )}

          {savings.length > 0 ? (
            <SavingList
              savings={savings}
              getSavedAmount={getSavedAmount}
              handleDeleteSaving={handleDeleteSaving}
              getSavingReminder={getSavingReminder}
            />
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
              <BudgetForm
                budgetForm={budgetForm}
                handleBudgetForm={handleBudgetForm}
                handleAddBudget={handleAddBudget}
                resetBudgetForm={resetBudgetForm}
                availableCategories={availableCategories}
              />
            )}
            {addSaving && (
              <SavingForm
                savingForm={savingForm}
                handleSavingForm={handleSavingForm}
                handleAddSaving={handleAddSaving}
                resetSavingForm={resetSavingForm}
              />
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
export default AllowancePage;