import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';


const ExpensesPage = () => {
  const { user } = useContext(UserContext);
  const [addExpense, setAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState([]);

  // Single state object for form fields
  const [formData, setFormData] = useState({
    expenseType: "new",
    category: "",
    name: "",
    date: "",
    amount: "",
    description: "",
  });

  const [filterExpenses, setFilterExpenses] = useState({
    category: "",
    name: "",
    date: "",
    amountmin: "",
    amountmax: "",
    // sortby: "",
  });

  const expensesRef = collection(db, "expenses");

  const fetchExpenses = async () => {
    try {
      const conditions = [];
      if (filterExpenses.category) {
        conditions.push(where("category", "==", filterExpenses.category));
      }
      if (filterExpenses.name) {
        conditions.push(where("name", "==", filterExpenses.name));
      }
      if (filterExpenses.date) {
        conditions.push(where("date", "==", filterExpenses.date));
      }
      if (filterExpenses.amountmin) {
        conditions.push(where("amount", ">=", parseFloat(filterExpenses.amountmin)));
      }
      if (filterExpenses.amountmax) {
        conditions.push(where("amount", "<=", parseFloat(filterExpenses.amountmax)));
      }

      let q;
      if (conditions.length > 0) {
        // If there are filters, include them in the query
        q = query(expensesRef, where("user_id", "==", user.uid), ...conditions);
      } else {
        // If no filters, fetch all expenses for the user
        q = query(expensesRef, where("user_id", "==", user.uid));
      }

      const querySnapshot = await getDocs(q);

      // if (customq.trim() !== "") {
      //   const q = query(expensesRef, where("user_id", "==", user.uid), where("name", "==", customq));
      //   querySnapshot = await getDocs(q);
      // } else {
      //   const q = query(expensesRef, where("user_id", "==", user.uid));
      //   querySnapshot = await getDocs(q);
      // }

      const expensesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFilterExpenseChange = (e) => {
    console.log(filterExpenses);
    const { name, value } = e.target;
    setFilterExpenses((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterExpenses]);

  useEffect(() => {
    fetchExpenses();
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
        {!loading ? (
          <>
            <div className="text-5xl">Spent this Month: N/A</div>
            <button
              className="w-20 h-6 bg-green-600 rounded-4xl my-5"
              onClick={() => setAddExpense(!addExpense)}
            >
              +Add
            </button>
            {addExpense ? (
              <div className="flex flex-row flex-wrap bg-gray-700 rounded-3xl p-2 px-4 my-3">
                <div>
                  <h1 className="text-lg">New Expense</h1>
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
            ) : null}
            <ul className="bg-gray-700 p-2 rounded-2xl">
              <div className="flex flex-row flex-wrap p-1">
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 w-70"
                  type="text"
                  name="name"
                  value={filterExpenses.name}
                  placeholder="Search Expense Records"
                  onChange={handleFilterExpenseChange}
                />
                <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="date"
                      name="date"
                      value={filterExpenses.date}
                      onChange={handleFilterExpenseChange}
                    />
                <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1"
                      type="text"
                      name="category"
                      value={filterExpenses.category}
                      placeholder="Category"
                      onChange={handleFilterExpenseChange}
                    />
                <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20"
                      type="number"
                      name="amountmin"
                      value={filterExpenses.amountmin}
                      placeholder="$ min"
                      onChange={handleFilterExpenseChange}
                    />
                <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-20"
                      type="number"
                      name="amountmax"
                      value={filterExpenses.amountmax}
                      placeholder="$ max"
                      onChange={handleFilterExpenseChange}
                    />
              </div>
              <div className="flex flex-row p-1">
                <div className="w-100">Name</div>
                <div className="w-40">Date</div>
                <div className="w-60">Category</div>
                <div>Amount</div>
              </div>
              <div className="flex flex-col items-center">
                {expenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="flex flex-row justify-around w-full bg-gray-600 rounded-xl m-1"
                  >
                    <div className="w-100">{expense.name}</div>
                    <div className="w-40">{expense.date}</div>
                    <div className="w-60">{expense.category}</div>
                    <div>{expense.amount}</div>
                  </li>
                ))}
              </div>
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ExpensesPage;