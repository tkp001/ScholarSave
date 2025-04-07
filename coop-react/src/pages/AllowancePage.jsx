import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';

import BudgetWidget from '../components/BudgetWidget';
import SavingWidget from '../components/SavingWidget';

const AllowancePage = () => {
  const { user } = useContext(UserContext);

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
    fetchBudgets();
    // fetchSavings();
  },[])

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
      {budgets.map((budget) => (
             <li
                key={budget.id}
              >
                <BudgetWidget name={budget.name} category={budget.category} startDate={budget.start_date} endDate={budget.end_date} amount={budget.amount} progress={100/budget.amount}/>
              </li>
            ))}
      </div>
    </div>
  )
}

export default AllowancePage