import React from 'react'
import UserContext from '../UserContext';
import { useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import '../App.css';
import { Link } from 'react-router-dom';

const AccountViewer = () => {
  const { user } = useContext(UserContext);
  const {accounts} = useContext(UserContext);
  const {updateAccounts} = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {updateViewedAccount} = useContext(UserContext);
  const {fetchAccounts} = useContext(UserContext);
  
    
      
  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);
    
  // Handle account selection
  function changeViewedAccount(e) {
      const selectedAccountId = e.target.value;
      const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
      // setViewedAccount(selectedAccount);
      updateViewedAccount(selectedAccount);
      fetchAccounts();
    }

  return (
    <div className="bg-gray-600 p-2 px-5 rounded-3xl w-200 mb-5">
      <div className="text-2xl">Choose An Account:</div>
      {accounts.length === 0 ? (
        <div className="m-1 px-2 w-fit bg-green-600 rounded-xl text-white scale-on-hover">
          <Link
            to="/balance"
          >
            Add Account
          </Link>
        </div>
      ) : (
        <select
          className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-100 scale-on-hover"
          name="accountSelector"
          value={viewedAccount?.id || ""}
          onChange={changeViewedAccount}
        >
          <option value="" disabled>
            Select an account
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.nickname} - {account.account_number} - ${parseFloat(account.balance).toFixed(2)}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default AccountViewer
