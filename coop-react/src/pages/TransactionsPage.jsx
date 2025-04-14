import React, { use, useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
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
    category: "",
    name: "",
    date: "",
    amountmin: "",
    amountmax: "",
  });

  const [transactionForm, setTransactionForm] = useState({
    name: "",
    category: "",
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
    } else {
      setTransactionForm((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const addNewTransaction = async () => {
    //ensure to update timestamp for last modified and last transaction for the accNumber
    if (!transactionForm.name || !transactionForm.category || !transactionForm.date || !transactionForm.amount) {
      alert("All fields are required. Please fill out the form completely.");
      return;
    }

    try {
      const transactionsRef = collection(db, "transactions");
      const transactionDocRef = await addDoc(transactionsRef, {...transactionForm, account_number: viewedAccount?.account_number || "",});

      //update the last modified and last transaction for the account
      if (viewedAccount) {
        const accountDocRef = doc(db, "accounts", viewedAccount.id);
        //fetch most updated account data
        // const accountSnapshot = await getDoc(accountDocRef);
        
        let newBalance;
        if (transactionForm.type == "Expense") {
          newBalance = parseFloat(viewedAccount.balance) - parseFloat(transactionForm.amount);
        } else if (transactionForm.type == "Income") {
          newBalance = parseFloat(viewedAccount.balance) + parseFloat(transactionForm.amount);
        } else newBalance = parseFloat(viewedAccount.balance);

        console.log("viewedAccount.balance", viewedAccount.balance);
        console.log("transactionForm.amount", transactionForm.amount);
        console.log("newBalance", newBalance);

        await updateDoc(accountDocRef, {
          balance: newBalance,
          last_modified: new Date().toLocaleString(),
          last_transaction: transactionDocRef.id,
        });
      }


      alert("Transaction added successfully!");
      setAddTransaction(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      // const conditions = [];

      // //Add filters
      // if (filterExpenses.category) {
      //   conditions.push(where("category", "==", filterExpenses.category));
      // }
      // if (filterExpenses.name) {
      //   conditions.push(where("name", "==", filterExpenses.name));
      // }
      // if (filterExpenses.date) {
      //   conditions.push(where("date", "==", filterExpenses.date));
      // }

      // //Add range filters
      // if (filterExpenses.amountmin && filterExpenses.amountmax) {
      //   conditions.push(where("amount", ">=", parseFloat(filterExpenses.amountmin)));
      //   conditions.push(where("amount", "<=", parseFloat(filterExpenses.amountmax)));
      // } else if (filterExpenses.amountmin) {
      //   conditions.push(where("amount", ">=", parseFloat(filterExpenses.amountmin)));
      // } else if (filterExpenses.amountmax) {
      //   conditions.push(where("amount", "<=", parseFloat(filterExpenses.amountmax)));
      // }

      // let q;
      // if (conditions.length > 0) {
      //   //If there are filters
      //   q = query(expensesRef, where("user_id", "==", user.uid), ...conditions);
      // } else {
      //   //If no filters
      //   q = query(expensesRef, where("user_id", "==", user.uid));
      // }

      const q = query(transactionsRef, where("user_id", "==", user.uid), where("account_number", "==", viewedAccount.account_number));

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
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
                  type="text"
                  name="category"
                  value={transactionForm.category}
                  placeholder="Category"
                  onChange={handleTransactionForm}
                />
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

            {/* <div className="text-5xl">Spent this Month: N/A</div>
            <div>
              <button
                className="w-24 h-8 bg-green-600 rounded-4xl my-5 mr-3"
                onClick={() => setAddExpense(!addExpense)}
              >+ Add</button>
              <button
                className="w-60 h-8 bg-amber-400 rounded-4xl my-5 mr-3"
                onClick={() => console.log("upload")}
              >+ Upload Expenses/Income</button>
            </div>

            {addExpense ? (
              <ExpenseForm fetchExpenses={fetchExpenses}/>
            ) : null}

            <ExpenseList
              expenses={expenses}
              filterExpenses={filterExpenses}
              handleFilterExpenseChange={handleFilterExpenseChange}
            />

            <div className='text-3xl'>Budget Widgets</div>
            <BudgetWidget progress={100}/>
            <div className='text-3xl my-3'>Saving Widgets</div>
            <SavingWidget progress={50} />
            <SavingWidget progress={90} /> */
            }
      </div>
    </div>
  );
};

export default TransactionsPage;