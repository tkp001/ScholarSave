import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import UserContext from '../UserContext';
import { useContext } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';


const ExpensesPage = () => {
  const { user } = useContext(UserContext);

  const [addExpense, setAddExpense] = useState(false);


  const [expenses, setExpenses] = useState([]);
  const [filterExpenses, setFilterExpenses] = useState({
    category: "",
    name: "",
    date: "",
    amountmin: "",
    amountmax: "",
  });

  const expensesRef = collection(db, "expenses");

  const handleFilterExpenseChange = (e) => {
    const { name, value } = e.target;
    setFilterExpenses((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const fetchExpenses = async () => {
    if (!user || !user.uid) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      const conditions = [];

      // Add filters for category, name, and date
      if (filterExpenses.category) {
        conditions.push(where("category", "==", filterExpenses.category));
      }
      if (filterExpenses.name) {
        conditions.push(where("name", "==", filterExpenses.name));
      }
      if (filterExpenses.date) {
        conditions.push(where("date", "==", filterExpenses.date));
      }

      // Add range filters for amount
      if (filterExpenses.amountmin && filterExpenses.amountmax) {
        conditions.push(where("amount", ">=", parseFloat(filterExpenses.amountmin)));
        conditions.push(where("amount", "<=", parseFloat(filterExpenses.amountmax)));
      } else if (filterExpenses.amountmin) {
        conditions.push(where("amount", ">=", parseFloat(filterExpenses.amountmin)));
      } else if (filterExpenses.amountmax) {
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

      const expensesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterExpenses]);

  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full p-10 max-w-250">
          <>
            <div className="text-5xl">Spent this Month: N/A</div>
            <button
              className="w-20 h-8 bg-green-600 rounded-4xl my-5"
              onClick={() => setAddExpense(!addExpense)}
            >
              +Add
            </button>
            {addExpense ? (
              <ExpenseForm fetchExpenses={fetchExpenses}/>
            ) : null}

            <ExpenseList
              expenses={expenses}
              filterExpenses={filterExpenses}
              handleFilterExpenseChange={handleFilterExpenseChange}
            />
          </>
      </div>
    </div>
  );
};

export default ExpensesPage;