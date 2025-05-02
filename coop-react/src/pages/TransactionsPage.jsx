import React, { use, useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, deleteDoc, updateDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';
import TransactionList from '../components/TransactionList';
import AccountViewer from '../components/AccountViewer';
import ImportTransactions from '../components/ImportTransactions';


const TransactionsPage = () => {
  const { user } = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {accounts} = useContext(UserContext);
  const {updateViewedAccount} = useContext(UserContext);
  const {fetchAccounts} = useContext(UserContext);
  
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

  function resetTransactionForm() {
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

  function resetTransferForm() {
    setTransferForm({
      sourceAccount: "",
      destinationAccount: "",
      amount: "",
      type: "Withdrawl",
      date: "",
    });
  }

  const transactionsRef = collection(db, "transactions");
  
  async function fetchTransactions() {
    try {
      let q = query(
        transactionsRef,
        where("user_id", "==", user.uid),
        where("account_number", "==", viewedAccount.account_number),
        where("type", "==", filterTransactions.type)
      );

      // if (filterTransactions.filter == "Name and Category" && (filterTransactions.name || filterTransactions.category)) {
      
      // }

      // if (filterTransactions.name) {
      //   q = query(q, where("name", "==", filterTransactions.name));
      // }
      // if (filterTransactions.category) {
      //   q = query(q, where("category", "==", filterTransactions.category));
      // }
      
      if (filterTransactions.filter == "Date" && filterTransactions.date) {
        const date = new Date(filterTransactions.date);
        q = query(q, where("date", "==", new Date(filterTransactions.date).toLocaleDateString()));
      }
      if (filterTransactions.filter == "Date Range" && (filterTransactions.startDate && filterTransactions.endDate)) {
        const startDate = new Date(filterTransactions.startDate).toLocaleDateString();
        const endDate = new Date(filterTransactions.endDate).toLocaleDateString();
        q = query(q, where("date", ">=", startDate));
        q = query(q, where("date", "<=", endDate));
        q = query(q, orderBy("date", filterTransactions.filterOrder));
      }
      if (filterTransactions.filter == "Amount Range" && (filterTransactions.amountMin || filterTransactions.amountMax)) {
        const amountMin = parseFloat(filterTransactions.amountMin) || 0;
        const amountMax = parseFloat(filterTransactions.amountMax) || 1000000000;
        q = query(q, where("amount", ">=", amountMin));
        q = query(q, where("amount", "<=", amountMax));
        q = query(q, orderBy("amount", filterTransactions.filterOrder));
      }

      console.log(filterTransactions)
      const querySnapshot = await getDocs(q);

      const transactionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Perform local filtering for name and category
      const filteredTransactions = transactionsData.filter((transaction) => {
        const matchesName = filterTransactions.name
          ? transaction.name.toLowerCase().includes(filterTransactions.name.toLowerCase())
          : true;
        const matchesCategory = filterTransactions.category
          ? transaction.category.toLowerCase().includes(filterTransactions.category.toLowerCase())
          : true;

        return matchesName && matchesCategory;
      });

      setTransactions(filteredTransactions); // Local filtering
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleFilterTransaction = (e) => {
    const { name, value } = e.target;
    setFilterTransactions((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    console.log("filterTransactions", filterTransactions);
  };

  const handleTransferForm = (e) => {
    const { name, value } = e.target;
    setTransferForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "amount") {
      if (parseFloat(value) < 0) {
        setTransferForm((prevFormData) => ({
          ...prevFormData,
          type: "Withdrawl",
        }));
      } else {
        setTransferForm((prevFormData) => ({
          ...prevFormData,
          type: "Deposit",
        }));
      }
    }

    console.log("filterTransactions", filterTransactions);
  };

  const handleTransactionForm = (e) => {
    const { name, value } = e.target;
  
    // If the input is for the date, format it to only include the date
    if (name === "date") {
      const date = new Date(value).toLocaleDateString();
      const fullDate = new Date(value).toLocaleString();
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        date: date,
        fullDate: fullDate,
      }));     
    } else if (name === "category") {
      if (value === "Custom Category") {
        setTransactionForm((prevFormData) => ({
          ...prevFormData,
          category: "",
          customCategory: true,
        }));
      } else {
        setTransactionForm((prevFormData) => ({
          ...prevFormData,
          category: value,
          customCategory: false,
        }));
      }
    } else {
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "amount") {
      if (parseFloat(value) < 0) {
        setTransactionForm((prevFormData) => ({
          ...prevFormData,
          type: "Withdrawl",
        }));
      } else {
        setTransactionForm((prevFormData) => ({
          ...prevFormData,
          type: "Deposit",
        }));
      }
    }
    

    console.log("transactionForm", transactionForm);
  };

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
  
  // async function handleTransferMoney() {
  //   const { sourceAccount, destinationAccount, type, amount, date } = transferForm;
  
  //   // Validate inputs
  //   if (!sourceAccount || !destinationAccount || !amount || !date) {
  //     alert("Please fill out all fields.");
  //     return;
  //   }
  //   if (sourceAccount === destinationAccount) {
  //     alert("Source and destination accounts cannot be the same.");
  //     return;
  //   }
  
  //   try {
  //     // Fetch source and account documents
  //     const sourceAccountRef = doc(db, "accounts", sourceAccount);
  //     const destinationAccountRef = doc(db, "accounts", destinationAccount);
  //     const sourceSnapshot = await getDoc(sourceAccountRef);
  //     const destinationSnapshot = await getDoc(destinationAccountRef);
  
  //     if (!sourceSnapshot.exists() || !destinationSnapshot.exists()) {
  //       alert("One or both accounts do not exist.");
  //       return;
  //     }
  
  //     const sourceData = sourceSnapshot.data();
  //     const destinationData = destinationSnapshot.data();

  //     console.log("sourceData", sourceData);
  //     console.log("destinationData", destinationData);
  //     console.log("sourceSnapshot", sourceSnapshot);
  //     console.log("destinationSnapshot", destinationSnapshot);
  
  //     // if (parseFloat(sourceData.balance) < parseFloat(amount)) {
  //     //   alert("Insufficient balance in the source account.");
  //     //   return;
  //     // }
  
  //     // Log the transfer as a transaction
  //     const transactionsRef = collection(db, "transactions");
  //     let type1;
  //     let type2;

  //     if (parseFloat(amount) < 0) {
  //       type1 = "Withdrawl";
  //       type2 = "Deposit";
  //     } else {
  //       type1 = "Deposit";
  //       type2 = "Withdrawl";
  //     }

  //     // Transaction
  //     const transactionDocRef = await addDoc(transactionsRef, {
  //       name: "Transfer to " + destinationData.account_number,
  //       category: "Transfer",
  //       amount: parseFloat(amount),
  //       type: type1,
  //       account_number: sourceData.account_number,
  //       user_id: user.uid,
  //       date: new Date(transferForm.date).toLocaleDateString(),
  //     });
  
  //     const transactionDocRef2 = await addDoc(transactionsRef, {
  //       name: "Transfer from " + sourceData.account_number,
  //       category: "Transfer",
  //       amount: parseFloat(amount),
  //       type: type2,
  //       account_number: destinationData.account_number,
  //       user_id: user.uid,
  //       date: new Date(transferForm.date).toLocaleDateString(),
  //     });
      
      

  //     // Update account balances
  //     updateCategoryBreakdown(sourceAccountRef.id, "Transfer", type1, amount, date);
  //     updateCategoryBreakdown(destinationAccountRef.id, "Transfer", type2, amount, date);
  //     changeAccountBalance(type1, amount, sourceAccountRef.id, transactionDocRef.id);
  //     changeAccountBalance(type2, amount, destinationAccountRef.id, transactionDocRef2.id);

  //     alert("Money transferred successfully!");
  //     resetTransferForm();
  //     setTransferMoney(false);
  //   } catch (error) {
  //     console.error("Error transferring money:", error);
  //     alert("An error occurred while transferring money.");
  //   }
  // }

  async function handleTransferMoney() {
    const { sourceAccount, destinationAccount, amount, date } = transferForm;
  
    // Validate inputs
    if (!sourceAccount || !destinationAccount || !amount || !date) {
      alert("Please fill out all fields.");
      return;
    }
    if (sourceAccount === destinationAccount) {
      alert("Source and destination accounts cannot be the same.");
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount greater than zero.");
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
        alert("One or both accounts do not exist.");
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
          date: new Date(date).toLocaleDateString(),
        },
        {
          name: `Transfer from ${sourceData.account_number}`,
          category: "Transfer",
          amount: Math.abs(parseFloat(amount)), // Positive for destination
          type: "Deposit",
          account_number: destinationData.account_number,
          user_id: user.uid,
          date: new Date(date).toLocaleDateString(),
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
  
      alert("Money transferred successfully!");
      resetTransferForm();
      setTransferMoney(false);
    } catch (error) {
      console.error("Error transferring money:", error);
      alert("An error occurred while transferring money.");
    }
  }

  async function handleAddTransaction() {
    const { name, category, date, amount } = transactionForm;
  
    // Validate inputs
    if (!name || !category || !date || !amount) {
      alert("All fields are required. Please fill out the form completely.");
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
      });
  
      // Update account balance and category breakdown
      await Promise.all([
        updateCategoryBreakdown(viewedAccount.id, category, amount, date),
        changeAccountBalance(amount, viewedAccount.id, transactionDocRef.id),
      ]);
  
      resetTransactionForm();
      setAddTransaction(false);
      alert("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("An error occurred while adding the transaction.");
    }
  }

  async function handleDeleteTransaction(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
  
    if (!confirmDelete) return;
  
    try {
      const transactionDocRef = doc(db, "transactions", id);
      const transactionSnapshot = await getDoc(transactionDocRef);
  
      if (!transactionSnapshot.exists()) {
        alert("Transaction does not exist.");
        return;
      }
  
      const transactionData = transactionSnapshot.data();
  
      // Delete the transaction and update account balance and category breakdown
      await Promise.all([
        deleteDoc(transactionDocRef),
        updateCategoryBreakdown(viewedAccount.id, transactionData.category, -transactionData.amount, transactionData.date), // Reverse the amount
        changeAccountBalance(-transactionData.amount, viewedAccount.id), // Reverse the amount
      ]);
  
      alert("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("An error occurred while deleting the transaction.");
    }
  }

  useEffect(() => {
    if (viewedAccount){
      fetchTransactions();
    }
  }, [filterTransactions, viewedAccount]);

  // Stats and Advanced Account Updates

  async function updateCategoryBreakdown(accountId, category, amount, date) {
    const accountDocRef = doc(db, "accounts", accountId);
  
    // Extract year and month from the date
    const parsedDate = new Date(date);
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

  // Extra function
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
  
  // Get the categories for month (for dropdown, makes UI easier)
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

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
        <AccountViewer />
        
        <ImportTransactions />

        {viewedAccount && ( 
        <>
          <div className="text-2xl mb-1">View</div>   

          <>
            <TransactionList
              transactions={transactions}
              filterTransactions={filterTransactions}
              handleFilterTransaction={handleFilterTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
            />
          </>
          
          <div className='flex flex-row my-6'>
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 mr-3"
              onClick={() => setAddTransaction(!addTransaction)}
            >
              Add Transaction
            </button>
            <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2"
              onClick={() => setTransferMoney(!transferMoney)}
            >
              Transfer Money
            </button>

          </div>
          

          <div className='flex flex-row'>
            {addTransaction && (
                <div className="bg-gray-700 p-5 w-100 h-115 rounded-xl mr-4">
                  <h3 className="text-2xl mb-3">Add New Transaction</h3>
                  {/* <select
                    className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                    name="type"
                    value={transactionForm.type}
                    onChange={handleTransactionForm}
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawl">Withdrawl</option>
                  </select> */}
                  <input
                    className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                    type="text"
                    name="name"
                    value={transactionForm.name}
                    placeholder="Transaction Name"
                    onChange={handleTransactionForm}
                  />
                  <select
                    className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                    name="category"
                    value={transactionForm.category}
                    onChange={handleTransactionForm}
                  >
                    <option value="Custom Category">Custom Category</option>
                    <option value="" disabled>
                    --Default Categories--
                    </option>
                    <option value="Salary/Income">Salary/Income</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Rent/Mortgage">Rent/Mortgage</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Dining/Restaurant">Dining/Restaurant</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Loan/Credit Payments">Loan/Credit Payments</option>
                    <option value="Investment">Investment</option>

                    <option value="" disabled>
                    --Categories This Month--
                    </option>
                    {/* !Change how custom category is handled as these are seen as regular, instead compare category to default categories list IN ADDITION. */}
                    {getCategoriesForSelectedDate().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {transactionForm.customCategory && (
                    <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                      type="text"
                      name="customCategory"
                      value={transactionForm.category || ""}
                      placeholder="Enter Custom Category"
                      //update customCategory
                      onChange={(e) =>
                        setTransactionForm((prevFormData) => ({
                          ...prevFormData,
                          category: e.target.value,
                        }))
                      }
                    />
                  )}
                  <input
                    className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                    type="date"
                    name="date"
                    // value={transactionForm.date}
                    onChange={handleTransactionForm}
                  />
                  <input
                    className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                    type="number"
                    name="amount"
                    value={transactionForm.amount}
                    placeholder="Amount"
                    onChange={handleTransactionForm}
                  />
                  
                  <p className="text-md my-2">+ for Deposit</p>
                  <p className="text-md my-2">- for Withdrawl</p>
                  <p className="text-md my-2">You are performing "{transactionForm.type}"</p>

                  <button
                    className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3"
                    onClick={handleAddTransaction}
                  >
                    Save Transaction
                  </button>
                  <button
                    className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
                    onClick={resetTransactionForm}
                  >
                    Cancel
                  </button>
                </div>
              )}

            {transferMoney && (
              <div className="bg-gray-700 p-5 w-100 h-100 rounded-xl">
                <h3 className="text-2xl mb-3">Transfer Money</h3>
                <div className='w-full text-md text-center my-1 font-bold'>From</div>
                <select
                  className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                  name="sourceAccount"
                  value={transferForm.sourceAccount}
                  onChange={handleTransferForm}
                >
                  <option value="" disabled>
                    Select Source Account
                  </option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.nickname} - {account.account_number} - ${account.balance}
                    </option>
                  ))}
                </select>
                {/* <select
                  className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                  name="type"
                  value={transferForm.type}
                  onChange={handleTransferForm}
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawl">Withdrawl</option>
                </select> */}
                {/* <div>{transferForm.type}</div> */}
                <div className='w-full text-md text-center my-1 font-bold'>Deposit To</div>
                <select
                  className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                  name="destinationAccount"
                  value={transferForm.destinationAccount}
                  onChange={handleTransferForm}
                >
                  <option value="" disabled>
                    Select Destination Account
                  </option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.nickname} - {account.account_number} - ${account.balance}
                    </option>
                  ))}
                </select>
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                  type="date"
                  name="date"
                  value={transferForm.date}
                  onChange={handleTransferForm}
                />
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                  type="number"
                  name="amount"
                  value={transferForm.amount}
                  placeholder="Amount"
                  onChange={handleTransferForm}
                />
                
                <button
                  className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3"
                  onClick={handleTransferMoney}
                >
                  Transfer Money
                </button>

                <button
                    className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
                    onClick={resetTransferForm}
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
};

export default TransactionsPage;