import React from 'react'
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ExpensesPage = () => {
  const [addExpense, setAddExpense] = useState(false);
  
  const [expenses, setExpenses] = useState([]);


  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'expenses'));
        const expensesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);
  
  return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col w-full p-10">
          <div className='text-5xl'>Spent this Month: $400</div>
          <button className='w-20 h-6 bg-green-600 rounded-4xl my-5' onClick={() => console.log('click')}>+Add</button>
          {setExpenses ?
          
          <div className='flex flex-row bg-gray-700 rounded-3xl p-2 px-4'>
            <div>
              <h1 className='text-lg'>New Expense</h1>
            </div>

          </div>
          
           : null}
          <ul>
            {expenses.map((expense) => (
              <li key={expense.id} className="mb-2">
                {expense.name}: ${expense.amount}
              </li>
            ))}
          </ul>
        </div>
      </div>
  )
}

export default ExpensesPage