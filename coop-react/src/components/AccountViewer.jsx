import React from 'react'
import UserContext from '../UserContext';
import { useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
    }

  return (
    <div className="bg-gray-600 p-2 px-5 rounded-3xl w-200 mb-5">
      <div className="text-2xl">Choose An Account:</div>
      <select
            className="border-2 border-gray-500 bg-gray-700 rounded-xl m-1 p-1 w-100"
            name="accountSelector"
            value={viewedAccount?.id || ""}
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
    </div>
  )
}

export default AccountViewer
