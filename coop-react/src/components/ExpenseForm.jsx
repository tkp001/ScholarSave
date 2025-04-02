import React from 'react'
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';

const ExpenseForm = ({fetchExpenses}) => {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    const expensesRef = collection(db, "expenses");


    const [formData, setFormData] = useState({
        expenseType: "new",
        category: "",
        name: "",
        date: "",
        amount: "",
        description: "",
        });
  
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
    };
    const clearInputs = () => {
        setFormData({
          expenseType: "new",
          category: "",
          name: "",
          date: "",
          amount: "",
          description: "",
        });
    };
    
    const submitSingleExpense = async () => {
        const { name, amount, category, date, description } = formData;
      
        if (name && amount && category && date) {
          try {
            // Use expensesRef directly
            const docRef = await addDoc(expensesRef, {
              user_id: user.uid,
              name,
              date,
              category,
              amount,
              description,
            });
            fetchExpenses();
            clearInputs();
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        }
      };

return (
    <>
        <div className="flex flex-row flex-wrap bg-gray-700 rounded-3xl p-2 px-4 my-3">
                <div>
                  <h1 className="text-xl p-2">New Expense</h1>
                  <div>
                    <select
                      className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1"
                      name="expenseType"
                      value={formData.expenseType}
                      onChange={handleFormChange}
                    >
                      <option value="new">New Expense</option>
                      <option value="recurring">Recurring Expense</option>
                    </select>
                    <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                    />
                    <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="text"
                      name="category"
                      value={formData.category}
                      placeholder="Category"
                      onChange={handleFormChange}
                    />
                    <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="text"
                      name="name"
                      value={formData.name}
                      placeholder="Name"
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="number"
                      name="amount"
                      value={formData.amount}
                      placeholder="Amount"
                      onChange={handleFormChange}
                    />
                    <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="text"
                      name="description"
                      value={formData.description}
                      placeholder="Notes"
                      onChange={handleFormChange}
                    />
                    <button
                      className="bg-green-500 rounded-xl w-20 m-1 p-1"
                      onClick={submitSingleExpense}
                    >
                      Submit
                    </button>
                    <button
                      className="bg-red-500 rounded-xl w-20 m-1 p-1"
                      onClick={clearInputs}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
    
    </>
  )
}

export default ExpenseForm
