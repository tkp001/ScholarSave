import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate} from 'react-router-dom';
import './App.css'
import { app, analytics } from './firebaseConfig';
import { useState, useContext } from 'react';
import UserContext from './UserContext';
import { db } from './firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import TransactionsPage from './pages/TransactionsPage';
import BalancePage from './pages/BalancePage';
import AllowancePage from './pages/AllowancePage';
import LearningPage from './pages/LearningPage';
import ToolsPage from './pages/ToolsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';

function App() {

  const [user, setUser] = useState(null);
  const [viewedAccount, setViewedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const appAvailable = true

  // function fetchAccounts() {
  //   const accountsRef = collection(db, 'accounts');
  //   const q = query(accountsRef, where('user_id', '==', user.uid));
  //   getDocs(q)
  //     .then((querySnapshot) => {
  //       const accounts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //       updateAccounts(accounts);

  //       // // Update viewedAccount with the latest data
  //       // if (viewedAccount) {
  //       //   const updatedAccount = accounts.find(
  //       //     (account) => account.id === viewedAccount.id
  //       //   );
  //       //   if (updatedAccount) {
  //       //     updateViewedAccount(updatedAccount);
  //       //   }
  //       // }

  //       console.log(accounts);
  //   })
  //     .catch((error) => {
  //       console.error('Error fetching accounts: ', error);
  //     });
  // }

  /**
   * Fetch all accounts for the current user from Firestore and update state.
   * Updates the viewed account if it is invalid or stale.
   */
  function fetchAccounts() {
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("user_id", "==", user.uid));
    getDocs(q)
      .then((querySnapshot) => {
        const accounts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateAccounts(accounts);
  
        // Update viewedAccount only if it is invalid or stale
        if (viewedAccount) {
          const updatedAccount = accounts.find(
            (account) => account.id === viewedAccount.id
          );
          if (!updatedAccount) {
            // If the currently viewed account no longer exists, reset it
            updateViewedAccount(null);
          } else if (JSON.stringify(updatedAccount) !== JSON.stringify(viewedAccount)) {
            // If the viewedAccount data is stale, update it
            updateViewedAccount(updatedAccount);
          }
        }
  
        console.log(accounts);
      })
      .catch((error) => {
        console.error("Error fetching accounts: ", error);
        toastMessage("Error fetching accounts", "error");
      });
  }
  
  /**
   * Update the user state in context.
   * @param {object|null} newUser - The new user object or null if signed out.
   */
  function updateUser(newUser) {
    setUser(newUser)
  }

  /**
   * Update the currently viewed account in context.
   * @param {object|null} newAccount - The new account object or null.
   */
  function updateViewedAccount(newAccount) {
    setViewedAccount(newAccount)
  }

  /**
   * Update the accounts array in context.
   * @param {Array} newAccounts - The new array of account objects.
   */
  function updateAccounts(newAccounts) {
    setAccounts(newAccounts)
  }

  /**
   * Show a toast notification with the given message and type.
   * @param {string} message - The message to display.
   * @param {string} type - The type of notification ("error", "success", "warning", or other).
   */
  function toastMessage(message, type) {
      if (type === "error") {
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "colored",
        });
      } else if (type === "success") {
        toast.success(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "colored",
  
        });
      } else if (type === "warning") {
        toast.warn(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "colored",
        });
      }
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path='/balance' element={<BalancePage />} />
        <Route path='/transactions' element={<TransactionsPage />} />
        <Route path='/allowance' element={<AllowancePage />} />
        <Route path='/learning' element={<LearningPage />} /> 
        <Route path='/tools' element={<ToolsPage />} /> 
        <Route path='/settings' element={<SettingsPage />} /> 
        <Route path='/auth' element={<AuthPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    )
  );

  return (
    appAvailable ? (
      <UserContext.Provider value={{ user, updateUser, viewedAccount, updateViewedAccount, accounts, updateAccounts, fetchAccounts, toastMessage }}>
        <ToastContainer />
        <div>
          <RouterProvider router={router} />
        </div>
      </UserContext.Provider>
    ) : (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl mb-4">App Unavailable</h1>
          <p className="text-lg">Come back later.</p>
        </div>
      </div>
    )
  )
}

export default App