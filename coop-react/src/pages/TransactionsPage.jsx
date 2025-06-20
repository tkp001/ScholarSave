import React, { useEffect, useState } from 'react';
import '../App.css';
import { db } from '../firebaseConfig';
import { Timestamp, collection, getDocs, getDoc, doc, deleteDoc, updateDoc, addDoc, query, where, orderBy,writeBatch } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';
import TransactionList from '../components/TransactionList';
import AccountViewer from '../components/AccountViewer';
import ImportTransactions from '../components/TransactionsPage/ImportTransactions';
import { toast } from 'react-toastify';
import TransactionForm from '../components/TransactionsPage/TransactionForm';
import TransferForm from '../components/TransactionsPage/TransferForm';

const TransactionsPage = () => {
  const { user } = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {accounts} = useContext(UserContext);
  const {updateViewedAccount} = useContext(UserContext);
  const {fetchAccounts} = useContext(UserContext);
  const {toastMessage} = useContext(UserContext);
  const [animateKey, setAnimateKey] = useState(0); 
  // Transactions

  const [addTransaction, setAddTransaction] = useState(false);
  const [transferMoney, setTransferMoney] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [filterTransactions, setFilterTransactions] = useState({
    name: "",
    category: "",
    
    type: "Withdrawl",
    filter: "None",
    filterOrder: "asc",
    date: "",
    startDate: "",
    endDate: "",
    amountMin: "",
    amountMax: "",
  });

  const [transactionForm, setTransactionForm] = useState({
    name: "",
    category: "Salary/Income",
    customCategory: false,
    amount: "",
    type: "Withdrawl",
    description: "",
    date: "",
    fullDate: "",
    referrence_id: "",
    currency: "",
  });

  /**
   * Reset the transaction form to its initial state and toggle the addTransaction modal.
   */
  function resetTransactionForm() {
    setAddTransaction(!addTransaction);
    setTransactionForm({
      name: "",
      category: "Salary/Income",
      customCategory: false,
      amount: "",
      type: "Withdrawl",
      description: "",
      date: "",
      fullDate: "",
      referrence_id: "",
      currency: "",
    });
  }

  const [transferForm, setTransferForm] = useState({
    sourceAccount: "",
    destinationAccount: "",
    amount: "",
    type: "Withdrawl",
    date: "",
  });

  /**
   * Reset the transfer form to its initial state and toggle the transferMoney modal.
   */
  function resetTransferForm() {
    setTransferMoney(!transferMoney);
    setTransferForm({
      sourceAccount: "",
      destinationAccount: "",
      amount: "",
      type: "Withdrawl",
      date: "",
    });
  }

  const transactionsRef = collection(db, "transactions");
  
  /**
   * Fetch transactions for the current user and viewed account, applying filters as needed.
   * Updates the transactions state with the results.
   */
  async function fetchTransactions() {
    try {
      let q = query(
        transactionsRef,
        where("user_id", "==", user.uid),
        where("account_number", "==", viewedAccount.account_number),
        where("type", "==", filterTransactions.type)
      );

      // Amount Filter

      if (filterTransactions.amountMin !== "") {
        q = query(q, where("amount", ">=", parseFloat(filterTransactions.amountMin)));
      
        if (filterTransactions.amountMax !== "") {
          q = query(q, where("amount", "<=", parseFloat(filterTransactions.amountMax)));
        }
        q = query(q, orderBy("amount", filterTransactions.filterOrder));
      }
      
  
      // Apply date filter
      if (filterTransactions.filter === "Date" && filterTransactions.date) {
        const localDate = new Date(filterTransactions.date);
      
        // Set startOfDay to 00:00:00
        const startOfDay = Timestamp.fromDate(
          new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0)
        );
      
        // Set endOfDay to 23:59:59
        const endOfDay = Timestamp.fromDate(
          new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59)
        );
      
        q = query(q, where("fullDate", ">=", startOfDay));
        q = query(q, where("fullDate", "<=", endOfDay));
      }
  
      // Apply date range filter
      if (filterTransactions.filter === "Date Range" && filterTransactions.startDate && filterTransactions.endDate) {
        const startDate = new Date(filterTransactions.startDate);
        const endDate = new Date(filterTransactions.endDate);
  
        const startOfDay = Timestamp.fromDate(
          new Date(startDate.getTime())
        );
        const endOfDay = Timestamp.fromDate(
          new Date(endDate.getTime())
        );
  
        q = query(q, where("fullDate", ">=", startOfDay));
        q = query(q, where("fullDate", "<=", endOfDay));
        q = query(q, orderBy("fullDate", filterTransactions.filterOrder));
      }
  
      const querySnapshot = await getDocs(q);
  
      const transactionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toastMessage("Error fetching transactions", "error");
    }
  }

  /**
   * Handle changes to the transaction filter form.
   * Updates filterTransactions state.
   * @param {Object} e - The event object from the input change.
   */
  const handleFilterTransaction = (e) => {
    const { name, value } = e.target;
    setFilterTransactions((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    console.log("filterTransactions", filterTransactions);
  };

  /**
   * Handle changes to the transaction form (add/edit).
   * Updates transactionForm state.
   * @param {Object} e - The event object from the input change.
   */
  const handleTransactionForm = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      const localDate = new Date(value);
      const fullDate = Timestamp.fromDate(localDate);
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        date: value,
        fullDate: fullDate,
      }));
    } else if (name === "category") {
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        category: value,
        customCategory: value === "Custom Category",
      }));
    } else if (name === "customCategory") {
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        category: value,
        customCategory: true,
      }));
    } else {
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "amount") {
      const amountValue = parseFloat(value);
      const typeValue = amountValue < 0 ? "Withdrawl" : "Deposit";
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        type: typeValue,
      }));
    }

    console.log("transactionForm", transactionForm);
  };
  
  /**
   * Handle changes to the transfer form.
   * Updates transferForm state.
   * @param {Object} e - The event object from the input change.
   */
  const handleTransferForm = (e) => {
    const { name, value } = e.target;
  
    if (name === "date") {
      // Parse the input date as a local date
      const localDate = new Date(value);
  
      // Normalize to midnight UTC
      // const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
  
      const fullDate = Timestamp.fromDate(localDate); // Store as Firestore Timestamp
  
      setTransferForm((prevFormData) => ({
        ...prevFormData,
        date: value, // Keep the original date string (YYYY-MM-DD)
        fullDate: fullDate, // Store the date 
      }));
    } else {
      setTransferForm((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  
    console.log("transferForm", transferForm);
  };

  /**
   * Updates the balance of an account by a given amount and records the last transaction.
   * Fetches the latest account data, calculates the new balance, and updates Firestore.
   * @param {number|string} amount - The amount to change (positive for deposit, negative for withdrawal).
   * @param {string} accountId - The Firestore document ID of the account.
   * @param {string} transactionDocRef - The Firestore document ID of the related transaction (optional).
   */
  async function changeAccountBalance(amount, accountId, transactionDocRef = "N/A") {
    fetchAccounts();
    const accountDocRef = doc(db, "accounts", accountId);
  
    // Fetch the most updated data
    const accountSnapshot = await getDoc(accountDocRef);
    const accountData = accountSnapshot.data();
  
    let newBalance;
    if (parseFloat(amount) < 0) {
      // Withdrawl
      newBalance = parseFloat(accountData.balance) + parseFloat(amount); // Subtract amount
      console.log("Withdrawl");
    } else {
      // Deposit
      newBalance = parseFloat(accountData.balance) + parseFloat(amount); // Add amount
      console.log("Deposit");
    }
  
    console.log("accountData.balance", accountData.balance);
    console.log("amount", amount);
    console.log("newBalance", newBalance);
  
    // Update the last modified and last transaction for the account
    await updateDoc(accountDocRef, {
      balance: newBalance,
      last_modified: new Date().toLocaleString(),
      last_transaction: transactionDocRef,
    });
  
    fetchAccounts();
    fetchTransactions();
  }

  /**
   * Handle transferring money between two accounts.
   * Validates input, creates transfer transactions, updates balances and category breakdowns.
   */
  async function handleTransferMoney() {
    const { sourceAccount, destinationAccount, amount, date } = transferForm;
  
    // Validate inputs
    if (!sourceAccount || !destinationAccount || !amount || !date) {
      toastMessage("All fields are required. Please fill out the form completely.", "warning");
      return;
    }
    if (sourceAccount === destinationAccount) {
      toastMessage("Source and destination accounts cannot be the same.", "warning");
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      toastMessage("Amount must be a positive number.", "warning");
      return;
    }
  
    try {
      // Fetch source and destination account documents
      const sourceAccountRef = doc(db, "accounts", sourceAccount);
      const destinationAccountRef = doc(db, "accounts", destinationAccount);
  
      const [sourceSnapshot, destinationSnapshot] = await Promise.all([
        getDoc(sourceAccountRef),
        getDoc(destinationAccountRef),
      ]);
  
      if (!sourceSnapshot.exists() || !destinationSnapshot.exists()) {
        toastMessage("One or both accounts do not exist.", "error");
        return;
      }
  
      const sourceData = sourceSnapshot.data();
      const destinationData = destinationSnapshot.data();
  
      // Log the transfer as transactions
      const transactionsRef = collection(db, "transactions");

      let type1;
      let type2;

      // if (parseFloat(amount) > 0) {
      //   type1 = "Withdrawl";
      //   type2 = "Deposit";
      // } else {
      //   type1 = "Deposit";
      //   type2 = "Withdrawl";
      // }

      const transactionData = [
        {
          name: `Transfer to ${destinationData.account_number}`,
          category: "Transfer",
          amount: -Math.abs(parseFloat(amount)), // Negative for source
          type: "Withdrawl",
          account_number: sourceData.account_number,
          user_id: user.uid,
          date: transferForm.date,
          fullDate: transferForm.fullDate, // Store as Firestore Timestamp
        },
        {
          name: `Transfer from ${sourceData.account_number}`,
          category: "Transfer",
          amount: Math.abs(parseFloat(amount)), // Positive for destination
          type: "Deposit",
          account_number: destinationData.account_number,
          user_id: user.uid,
          date: transferForm,
          fullDate: transferForm.fullDate, // Store as Firestore Timestamp
        },
      ];
  
      const [sourceTransaction, destinationTransaction] = await Promise.all(
        transactionData.map((data) => addDoc(transactionsRef, data))
      );
  
      // Update account balances and category breakdowns
      await Promise.all([
        updateCategoryBreakdown(sourceAccountRef.id, "Transfer", -amount, date),
        updateCategoryBreakdown(destinationAccountRef.id, "Transfer", amount, date),
        changeAccountBalance(-amount, sourceAccountRef.id, sourceTransaction.id),
        changeAccountBalance(amount, destinationAccountRef.id, destinationTransaction.id),
      ]);
  
      toastMessage("Transfer successful!", "success");
      resetTransferForm();
      setTransferMoney(false);
    } catch (error) {
      console.error("Error transferring money:", error);
      toastMessage("Error transferring money", "error");
    }
  }

  /**
   * Handle adding a new transaction for the viewed account.
   * Validates input, creates transaction, updates balance and category breakdown.
   */
  async function handleAddTransaction() {
    const { name, category, date, amount } = transactionForm;
  
    // Validate inputs
    if (!name || !category || !date || !amount) {
      toastMessage("All fields are required. Please fill out the form completely.", "warning");
      return;
    }
  
    try {
      const transactionsRef = collection(db, "transactions");
  
      // Add transaction to Firestore
      const transactionDocRef = await addDoc(transactionsRef, {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount), // Ensure amount is a number
        account_number: viewedAccount?.account_number || "",
        user_id: user.uid,
        // fullDate: transactionForm.fullDate || Timestamp.fromDate(new Date(date)), // Ensure fullDate is a Timestamp
      });
  
      // Update account balance and category breakdown
      await Promise.all([
        updateCategoryBreakdown(viewedAccount.id, category, amount, date),
        changeAccountBalance(amount, viewedAccount.id, transactionDocRef.id),
      ]);
  
      resetTransactionForm();
      setAddTransaction(false);
      toastMessage("Transaction added successfully!", "success");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toastMessage("Error adding transaction", "error");
    }
  }

  /**
   * Handle deleting a transaction by ID.
   * Reverses the transaction's effect on balance and category breakdown.
   * @param {string} id - The Firestore document ID of the transaction to delete.
   */
  async function handleDeleteTransaction(id) {
    // const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
  
    // if (!confirmDelete) return;
  
    try {
      const transactionDocRef = doc(db, "transactions", id);
      const transactionSnapshot = await getDoc(transactionDocRef);
  
      if (!transactionSnapshot.exists()) {
        toastMessage("Transaction does not exist.", "error");
        return;
      }
  
      const transactionData = transactionSnapshot.data();
  
      // Reverse the amount for category breakdown and account balance
      const reversedAmount = -parseFloat(transactionData.amount);
  
      await Promise.all([
        deleteDoc(transactionDocRef), // Delete the transaction
        updateCategoryBreakdown(
          viewedAccount.id,
          transactionData.category,
          reversedAmount,
          transactionData.date
        ), // Reverse the amount in the category breakdown
        changeAccountBalance(reversedAmount, viewedAccount.id), // Reverse the amount in the account balance
      ]);
  
      toastMessage("Transaction deleted successfully!", "success");
      fetchTransactions(); // Refresh the transactions list
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toastMessage("Error deleting transaction", "error");
    }
  }

  /**
   * Fetch the last transaction for the viewed account.
   */
  useEffect(() => {
    if (viewedAccount){
      fetchTransactions();
    }
  }, [filterTransactions, viewedAccount]);

  // Stats and Advanced Account Updates

  /**
   * Update the category breakdown for an account for a given year/month/category.
   * @param {string} accountId - The Firestore account document ID.
   * @param {string} category - The transaction category.
   * @param {number|string} amount - The amount to add/subtract.
   * @param {string|Date} date - The transaction date.
   */
  async function updateCategoryBreakdown(accountId, category, amount, date) {
    const accountDocRef = doc(db, "accounts", accountId);
  
    // Extract year and month from the date
    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      console.error("Invalid date for category breakdown:", date);
      return; // Don't update if date is invalid
    }

    const year = parsedDate.getFullYear().toString(); // e.g., "2025"
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0"); // e.g., "04"
  
    // Fetch current account data
    const accountSnapshot = await getDoc(accountDocRef);
    const accountData = accountSnapshot.data();
  
    // Initialize or update category breakdown
    const categoryBreakdown = accountData.categoryBreakdown || {};
    if (!categoryBreakdown[year]) {
      categoryBreakdown[year] = {};
    }
    if (!categoryBreakdown[year][month]) {
      categoryBreakdown[year][month] = {};
    }
    if (!categoryBreakdown[year][month][category]) {
      categoryBreakdown[year][month][category] = 0;
    }
  
    // Update category based on the sign of the amount
    categoryBreakdown[year][month][category] += parseFloat(amount);
  
    await updateDoc(accountDocRef, { categoryBreakdown });
  }

  /**
   * Fetch the category breakdown for a specific account, year, and month.
   * @param {string} accountId - The Firestore account document ID.
   * @param {string} year - The year (e.g., "2025").
   * @param {string} month - The month (e.g., "04").
   * @returns {Promise<Object>} - The category breakdown object for the month.
   */
  async function fetchCategoryBreakdown(accountId, year, month) {
    const accountDocRef = doc(db, "accounts", accountId);
  
    // Fetch account document
    const accountSnapshot = await getDoc(accountDocRef);
    if (accountSnapshot.exists()) {
      const accountData = accountSnapshot.data();
      const categoryBreakdown = accountData.categoryBreakdown || {};
  
      // Get the breakdown
      const yearData = categoryBreakdown[year] || {};
      const monthData = yearData[month] || {};
  
      return monthData;
    } else {
      console.log("Account not found.");
      return {};
    }

    // const breakdown = await fetchCategoryBreakdown("account123", "2025", "04");
    // console.log(breakdown);
  }
  
  /**
   * Get the list of categories for the selected date in the transaction form.
   * Used for populating category dropdowns.
   * @returns {string[]} - Array of category names.
   */
  function getCategoriesForSelectedDate() {
    const { date } = transactionForm;
    const dateFormatted = new Date(date);
    const year = dateFormatted.getFullYear().toString();
    const month = (dateFormatted.getMonth() + 1).toString().padStart(2, "0");

    if (!year || !month) return [];
  
    const breakdown =
      viewedAccount?.categoryBreakdown?.[year]?.[month] || {};
  
    return Object.keys(breakdown);
  }

  // AI Import Transactions
  /**
   * Import a batch of corrected transactions (e.g., from AI or CSV import).
   * Adds transactions in batch, updates account data, and sets last transaction info.
   * @param {Array|Object} transactionData - Array of transaction objects or wrapped data.
   */
  async function importCorrectedTransactions(transactionData) {
    console.log("Importing corrected transactions...");
    console.log("transactions", transactionData);
  
    const transactionArray = transactionData?.data || transactionData;
  
    if (!Array.isArray(transactionArray) || transactionArray.length === 0) {
      toastMessage("No transactions to import or invalid data format.", "warning");
      return;
    }
  
    try {
      // Create a batch write
      const batch = writeBatch(db);
      let lastTransactionId = null; // Track the last transaction ID
      let lastTransactionDate = null; // Track the last transaction date


      transactionArray.forEach((transaction) => {
        const { name, category, date, amount } = transaction;
        if (!name || !category || !date || !amount) {
          console.error("Invalid transaction data:", transaction);
          return;
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date in imported transaction:", transaction);
          return;
        }
  
        let type;
        

        if (parseFloat(amount) < 0) {
          type = "Withdrawl";
        } else {
          type = "Deposit";
        }

        const transactionsRef = collection(db, "transactions");
        const transactionDocRef = doc(transactionsRef);
        batch.set(transactionDocRef, {
          ...transaction,
          amount: parseFloat(amount),
          account_number: viewedAccount?.account_number || "",
          user_id: user.uid,
          date: date,
          // fullDate: Timestamp.fromDate(new Date(date)), // fulldate areleady there.
          type: type,
        });

        // Track the last transaction
        lastTransactionId = transactionDocRef.id;
        lastTransactionDate = new Date(date);
      });
  
      // Commit the batch
      await batch.commit();
  
      // Recalculate account data
      await recalculateAccountData(viewedAccount.id);
  
      // Update the account with the last transaction and last modified date
      if (lastTransactionId && lastTransactionDate) {
        const accountDocRef = doc(db, "accounts", viewedAccount.id);
        await updateDoc(accountDocRef, {
          last_transaction: lastTransactionId,
          // last_modified: lastTransactionDate.toLocaleString(),
          last_modified: new Date().toLocaleString(),
        });
      }

      toastMessage("Transactions imported successfully!", "success");
      fetchAccounts();
      fetchTransactions();
    } catch (error) {
      console.error("Error importing transactions:", error);
      toastMessage("Error importing transactions", "error");
    }
  }

  /**
   * Recalculate the account's total balance and category breakdown from all transactions.
   * Updates the account document in Firestore.
   * @param {string} accountId - The Firestore account document ID.
   */
  async function recalculateAccountData(accountId) {
    try {
      console.log("Recalculating account data...");
  
      // Fetch all transactions for the account
      const q = query(
        transactionsRef,
        where("account_number", "==", viewedAccount.account_number),
        where("user_id", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
  
      const transactions = querySnapshot.docs.map((doc) => doc.data());
  
      // Initialize totals
      let totalBalance = 0;
      const categoryBreakdown = {};
  
      // Calculate totals
      transactions.forEach((transaction) => {
        const { category, amount, date } = transaction;
        const parsedAmount = parseFloat(amount);
        const parsedDate = new Date(date);
        const year = parsedDate.getFullYear().toString();
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
  
        // Update total balance
        totalBalance += parsedAmount;
  
        // Update category breakdown
        if (!categoryBreakdown[year]) {
          categoryBreakdown[year] = {};
        }
        if (!categoryBreakdown[year][month]) {
          categoryBreakdown[year][month] = {};
        }
        if (!categoryBreakdown[year][month][category]) {
          categoryBreakdown[year][month][category] = 0;
        }
        categoryBreakdown[year][month][category] += parsedAmount;
      });
  
      console.log("Total Balance:", totalBalance);
      console.log("Category Breakdown:", categoryBreakdown);
  
      // Write updated data to Firestore
      const accountDocRef = doc(db, "accounts", accountId);
      await updateDoc(accountDocRef, {
        balance: totalBalance,
        categoryBreakdown: categoryBreakdown,
        last_modified: new Date().toLocaleString(),
      });
  
      console.log("Account data recalculated and updated successfully.");
    } catch (error) {
      console.error("Error recalculating account data:", error);
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
          <ImportTransactions importCorrectedTransactions={importCorrectedTransactions}/>

          <div className="text-2xl mb-1">View</div>   

          <div key={animateKey} className="stagger-container">
            <TransactionList
              transactions={transactions}
              filterTransactions={filterTransactions}
              handleFilterTransaction={handleFilterTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
            />
          </div>
          
          <div className='flex flex-row my-6'>
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 mr-3 scale-on-hover"
              onClick={() => setAddTransaction(!addTransaction)}
            >
              Add Transaction
            </button>
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 scale-on-hover"
              onClick={() => setTransferMoney(!transferMoney)}
            >
              Transfer Money
            </button>

          </div>
          

          <div className='flex flex-row'>
            {addTransaction && (
              <TransactionForm
                transactionForm={transactionForm}
                handleTransactionForm={handleTransactionForm}
                handleAddTransaction={handleAddTransaction}
                resetTransactionForm={resetTransactionForm}
                getCategoriesForSelectedDate={getCategoriesForSelectedDate}
              />
            )}
            {transferMoney && (
              <TransferForm
                transferForm={transferForm}
                handleTransferForm={handleTransferForm}
                handleTransferMoney={handleTransferMoney}
                resetTransferForm={resetTransferForm}
                accounts={accounts}
              />
            )}
          </div>

          
        </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;