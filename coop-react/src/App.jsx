import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate} from 'react-router-dom';
import './App.css'
import { app, analytics } from './firebaseConfig';
import { useState, useContext } from 'react';
import UserContext from './UserContext';
import { db } from './firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
      });
  }
  
  function updateUser(newUser) {
    setUser(newUser)
  }

  function updateViewedAccount(newAccount) {
    setViewedAccount(newAccount)
  }

  function updateAccounts(newAccounts) {
    setAccounts(newAccounts)
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
    <UserContext.Provider value={{ user, updateUser, viewedAccount, updateViewedAccount, accounts, updateAccounts, fetchAccounts }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  )
}

export default App