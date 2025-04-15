import React, { use, useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, deleteDoc, updateDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import TransactionList from '../components/TransactionList';
import BudgetWidget from '../components/BudgetWidget';
import SavingWidget from '../components/SavingWidget';


const TransactionsPage = () => {
  const { user } = useContext(UserContext);
  const [accounts, setAccounts] = useState([]);
  const [viewedAccount, setViewedAccount] = useState(null);

  function fetchAccounts() {
      const accountsRef = collection(db, "accounts");
      const q = query(accountsRef, where("user_id", "==", user.uid));
      getDocs(q)
        .then((querySnapshot) => {
          const accounts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setAccounts(accounts);
          console.log(accounts);
        })
        .catch((error) => {
          console.error("Error fetching accounts: ", error);
        });
    }
    
  function changeViewedAccount(e) {
    const selectedAccountId = e.target.value;
    const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
    setViewedAccount(selectedAccount);
  }
  
  useEffect(() => {
    fetchAccounts();  
  }, []);


  //Transactions

  const [addTransaction, setAddTransaction] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [filterTransactions, setFilterTransactions] = useState({
    name: "",
    category: "",
    
    type: "Expense",
    filter: "No Filter",
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
    type: "Expense",
    description: "",
    referrence_id: "",
    currency: "",
    user_id: user.uid,
  });


  const transactionsRef = collection(db, "transactions");

  const handleFilterTransaction = (e) => {
    const { name, value } = e.target;
    setFilterTransactions((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

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

    console.log("transactionForm", transactionForm);
  };

  async function changeAccountBalance(type, amount, transactionDocRef="N/A") {
    if (viewedAccount) {
      const accountDocRef = doc(db, "accounts", viewedAccount.id);
      //fetch most updated account data
      // const accountSnapshot = await getDoc(accountDocRef);
      
      let newBalance;
      if (type == "Expense") {
        newBalance = parseFloat(viewedAccount.balance) - parseFloat(amount);
      } else if (type == "Income") {
        newBalance = parseFloat(viewedAccount.balance) + parseFloat(amount);
      } else newBalance = parseFloat(viewedAccount.balance);

      console.log("viewedAccount.balance", viewedAccount.balance);
      console.log("amount", amount);
      console.log("newBalance", newBalance);

      await updateDoc(accountDocRef, {
        balance: newBalance,
        last_modified: new Date().toLocaleString(),
        last_transaction: transactionDocRef,
      });
    }
  }
  

  async function addNewTransaction() {
    //ensure to update timestamp for last modified and last transaction for the accNumber
    if (!transactionForm.name || !transactionForm.category || !transactionForm.date || !transactionForm.amount) {
      alert("All fields are required. Please fill out the form completely.");
      return;
    }

    try {
      const transactionsRef = collection(db, "transactions");
      const transactionDocRef = await addDoc(transactionsRef, {...transactionForm, account_number: viewedAccount?.account_number || "",});

      //update the last modified and last transaction for the account
      changeAccountBalance(transactionForm.type, transactionForm.amount, transactionDocRef.id);
      
      setAddTransaction(false);
      fetchTransactions();
      alert("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  async function handleDeleteTransaction(id) {
    //deleting transaction DOES affect main balance
    
    const confirmDelete = true;

    if (confirmDelete) {
      const transactionDocRef = doc(db, "transactions", id);
      const transactionSnapshot = await getDoc(transactionDocRef);

      deleteDoc(transactionDocRef)
        .then(() => {
          changeAccountBalance(transactionSnapshot.data().type, (transactionSnapshot.data().amount*-1));
          alert("Transaction deleted successfully!");
          fetchTransactions();
        })
        .catch((error) => {
          console.error("Error deleting transaction: ", error);
        });
    }
  }

  const fetchTransactions = async () => {
    try {
      let q = query(
        transactionsRef,
        where("user_id", "==", user.uid),
        where("account_number", "==", viewedAccount.account_number),
        where("type", "==", filterTransactions.type)
      );

      if (filterTransactions.name) {
        q = query(q, where("name", "==", filterTransactions.name));
      }
      if (filterTransactions.category) {
        q = query(q, where("category", "==", filterTransactions.category));
      }
      
      if (filterTransactions.filter == "Date" && filterTransactions.date) {
        const date = new Date(filterTransactions.date);
        q = query(q, where("date", "==", new Date(filterTransactions.date).toLocaleDateString()));
      }
      if (filterTransactions.filter == "Date Range" && (filterTransactions.startDate && filterTransactions.endDate)) {
        const startDate = new Date(filterTransactions.startDate).toLocaleDateString();
        const endDate = new Date(filterTransactions.endDate).toLocaleDateString();
        q = query(q, where("date", ">=", startDate), where("date", "<=", endDate));
        q = query(q, orderBy("date", filterTransactions.filterOrder));
      }
      if (filterTransactions.filter == "Amount Range" && (filterTransactions.amountMin || filterTransactions.amountMax)) {
        const amountMin = parseFloat(filterTransactions.amountMin) || 0;
        const amountMax = parseFloat(filterTransactions.amountMax) || Infinity;
        q = query(q, where("amount", ">=", amountMin, where("amount", "<=", amountMax)));
        q = query(q, orderBy("amount", filterTransactions.filterOrder));
      }

      console.log(filterTransactions)
      const querySnapshot = await getDocs(q);

      const transactionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (viewedAccount){
      fetchTransactions();
    }
  }, [filterTransactions, viewedAccount]);

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
        <>
        <div>{new Date(new Date().toLocaleString()).toLocaleDateString()}</div>
          <div className="text-2xl">Choose An Account:</div>
          <select
            className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 mb-10 p-1 w-100"
            name="accountSelector"
            onChange={(e) => changeViewedAccount(e)}
          >
            <option value="" disabled selected>
              Select an account
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.nickname} - {account.account_number}
              </option>
            ))}
          </select>
        </>
        
        {viewedAccount && ( 
        <>
          <div className="text-2xl">View</div>   

          <>
            <TransactionList
              transactions={transactions}
              filterTransactions={filterTransactions}
              handleFilterTransaction={handleFilterTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
            />
          </>
          
          <button
              className="w-fit h-8 min-h-8 bg-green-600 rounded-4xl px-2 my-5"
              onClick={() => setAddTransaction(!addTransaction)}
            >
              + Add Transaction
          </button>

          {addTransaction && (
              <div className="bg-gray-700 p-5 w-100 rounded-xl">
                <h3 className="text-2xl mb-3">Add New Transaction</h3>
                <select
                  className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-full"
                  name="type"
                  value={transactionForm.type}
                  onChange={handleTransactionForm}
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
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
                <button
                  className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3"
                  onClick={addNewTransaction}
                >
                  Save Transaction
                </button>
                <button
                  className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
                  onClick={() => setAddTransaction(false)}
                >
                  Cancel
                </button>
              </div>
            )}
        </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;