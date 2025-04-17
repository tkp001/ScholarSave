import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';

import BudgetWidget from '../components/BudgetWidget';
import SavingWidget from '../components/SavingWidget';

const AllowancePage = () => {
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
    fetchAccounts();
  }


  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const budgetsRef = collection(db, "budgets");
  const savingsRef = collection(db, "savings");

  function fetchBudgets() {
    const q = query(budgetsRef, where("user_id", "==", user.uid));
    getDocs(q)
      .then((querySnapshot) => {
        const budgets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBudgets(budgets);
        console.log(budgets);
      })
      .catch((error) => {
        console.error("Error fetching budgets: ", error);
      });
  }

  useEffect(() => {
    fetchAccounts();
    // fetchBudgets();
    // fetchSavings();
  },[])

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
      <>
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
                {account.nickname} - {account.account_number} - ${account.balance}
              </option>
            ))}
          </select>
        </>
        
        {/* {budgets.map((budget) => (
             <li
                key={budget.id}
              >
                <BudgetWidget name={budget.name} category={budget.category} startDate={budget.start_date} endDate={budget.end_date} amount={budget.amount} progress={100/budget.amount}/>
              </li>
            ))}
      </div> }
      {<div className="text-5xl">Spent this Month: N/A</div>
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
            <SavingWidget progress={90} />
          } */}

      </div>
    </div>
  )
}

export default AllowancePage