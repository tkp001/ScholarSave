import React from 'react'
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const ExpensesPage = () => {
  const [addExpense, setAddExpense] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [expenseType, setExpenseType] = useState("new");
  const [category, setCategory] = useState(null);
  const [name, setName] = useState(null);
  const [date, setDate] = useState(null);
  const [amount, setAmount] = useState(null);
  const [description, setDescription] = useState(null);

  
  const [expenses, setExpenses] = useState([]);

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

  const submitSingleExpense = async () => {
    if (name && amount && category && date) {
      try {
        const docRef = await addDoc(collection(db, "expenses"), {
          user_id: "user1",
          name: name,
          date: date,
          category: category,
          amount: amount,
          description: description,
        });
        console.log("Document written with ID: ", docRef.id);
        fetchExpenses();
        clearInputs();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  }

  const clearInputs = () => {
    setExpenseType("new");
    setCategory("");
    setName("");
    setDate("");
    setAmount("");
    setDescription("");
  };


  useEffect(() => {  
    fetchExpenses();
    setLoading(false)
  }, []);
  
  return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col w-full p-10 max-w-250">
          {!loading ? 
          <>
            <div className='text-5xl'>Spent this Month: N/A</div>
            <button className='w-20 h-6 bg-green-600 rounded-4xl my-5' onClick={() => setAddExpense(!addExpense)}>+Add</button>
            {addExpense ?
            
            <div className='flex flex-row bg-gray-700 rounded-3xl p-2 px-4 my-3'>
              <div>
                <h1 className='text-lg'>New Expense</h1>
                <div>
                  <select
                    className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1"
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                  >
                    <option value="new">New Expense</option>
                    <option value="recurring">Recurring Expense</option>
                  </select>
                  <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  <input
                    className='border-2 border-gray-500 rounded-xl m-1 p-1'
                    type="input"
                    value={category}
                    placeholder='category'
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <input
                    className='border-2 border-gray-500 rounded-xl m-1 p-1'
                    type="input"
                    value={name}
                    placeholder='name'
                    onChange={(e) => setName(e.target.value)}
                  />
                
                
                </div>
                <div>
                  <input
                    className='border-2 border-gray-500 rounded-xl m-1 p-1'
                    type="input"
                    value={amount}
                    placeholder='amount'
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <input
                    className='border-2 border-gray-500 rounded-xl m-1 p-1'
                    type="input"
                    value={description}
                    placeholder='notes'
                    onChange={(e) => setDescription(e.target.value)}
                  />
                    <button className='bg-green-500 rounded-xl w-20 m-1 p-1' onClick={submitSingleExpense}>Submit</button>
                    <button className='bg-red-500 rounded-xl w-20 m-1 p-1' onClick={clearInputs}>Clear</button>
                </div>
                
              </div>
            </div>
            
            : null}
            <ul className='bg-gray-700 p-2 rounded-2xl'>
              <div className='flex flex-row p-1'>
                <input className='w-70 bg-gray-600 rounded-2xl pl-2' type='text' placeholder='Search' />
              </div>
              <div className='flex flex-row p-1'>
                <div className='w-100'>Name</div>
                <div className='w-40'>Date</div>
                <div className='w-60'>Category</div>
                <div>Amount</div>
              </div>
              <div className='flex flex-col items-center'>
                {expenses.map((expense) => (
                  <li key={expense.id} className="flex flex-row justify-around w-full bg-gray-600 rounded-xl m-1">
                    <div className='w-100'>{expense.name}</div>
                    <div className='w-40'>{expense.date}</div>
                    <div className='w-60'>{expense.category}</div>
                    <div>{expense.amount}</div>
                  </li>
                ))}
              </div>
            </ul>
          </>
          
          : null}
        </div>
      </div>
  )
}

export default ExpensesPage