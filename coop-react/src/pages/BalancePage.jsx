import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import UserContext from '../UserContext';
import AccountViewer from '../components/AccountViewer';

const BalancePage = () => {
  const { user } = useContext(UserContext);
  const {viewedAccount} = useContext(UserContext);
  const {updateViewedAccount} = useContext(UserContext);
  const [lastTransactionDetails, setLastTransactionDetails] = useState(null);
  const {fetchAccounts} = useContext(UserContext);

  async function fetchLastTransaction(transactionId) {
    if (!transactionId || transactionId === "N/A") {
      setLastTransactionDetails(null);
      return;
    }
  
    try {
      const transactionDocRef = doc(db, "transactions", transactionId);
      const transactionDoc = await getDoc(transactionDocRef);
  
      if (transactionDoc.exists()) {
        setLastTransactionDetails(transactionDoc.data());
      } else {
        console.error("Transaction not found.");
        setLastTransactionDetails(null);
      }
    } catch (error) {
      console.error("Error fetching transaction details: ", error);
      setLastTransactionDetails(null);
    }
  }

  useEffect(() => {
    if (viewedAccount) {
      fetchLastTransaction(viewedAccount.last_transaction);
    }
  }, [viewedAccount]);
  
  const [newAccount, setNewAccount] = useState();
  const [accountForm, setAccountForm] = useState({
    account_number: "",
    balance: 0,
    nickname: "",
    status: "active",
    user_id: user.uid,
    last_modified: new Date().toLocaleString(),
    last_transaction: "N/A",
  });
  
    const handleAccountForm = (e) => {
      const { name, value } = e.target;
      setAccountForm((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };

  const addNewAccount = async () => {
    if (!accountForm.nickname || !accountForm.account_number || !accountForm.balance) {
      alert("All fields are required. Please fill out the form completely.");
    } else {
      try {
        const accountsRef = collection(db, "accounts");
        await addDoc(accountsRef, accountForm);
        alert("New account added successfully!");
        setNewAccount(false);
        fetchAccounts();
      } catch (error) {
        console.error("Error adding new account: ", error);
      }
    }
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the account "${viewedAccount.account_number}"? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        const accountDocRef = doc(db, "accounts", viewedAccount.id);
        await deleteDoc(accountDocRef);
        alert("Account deleted successfully!");
        updateViewedAccount(null);
        fetchAccounts();
      } catch (error) {
        console.error("Error deleting account: ", error);
      }
    }
  };


  return (
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full h-400 p-10">
        <AccountViewer />
        

        {viewedAccount ? (
          <>
            <div className="text-3xl">Total Balance</div>
            <div className="text-5xl mb-10">${parseFloat(viewedAccount.balance).toFixed(2)}</div>

            <div className="text-3xl">Last Modified</div>
            <div className="text-2xl mb-10">{viewedAccount.last_modified}</div>

            <div className="text-3xl">Last Transaction</div>
            {lastTransactionDetails ? (
              <div className="text-2xl mb-10">
                <p className='text-sm'>ID: {viewedAccount.last_transaction}</p>
                <p>Name:  {lastTransactionDetails.name}</p>
                <p>Amount: ${lastTransactionDetails.amount}</p>
                <p>Category: {lastTransactionDetails.category}</p>
                
              </div>
            ) : (
              <div className="text-2xl mb-10">No transaction details available.</div>
            )}

            <button
              className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
              onClick={deleteAccount}
            >
              Unlink Account
            </button>
          </>
        ) : <div className="text-xl my-2">Please select an account to view details.</div> }
          <>
            <button
              className="w-fit min-h-8 h-8 bg-green-600 rounded-4xl px-2 mr-3"
              onClick={() => setNewAccount(!newAccount)}
            >+ New Account
            </button>
          </>
          
        
        {newAccount && (
          <div className="bg-gray-700 w-100 p-5 my-5 rounded-xl">
            <h3 className="text-2xl mb-3">Add New Account</h3>
            <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
              type="text"
              name="nickname"
              value={accountForm.nickname}
              placeholder="Account Nickname"
              onChange={handleAccountForm}
            />
            <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
              type="text"
              name="account_number"
              value={accountForm.account_number}
              placeholder="Account Number"
              onChange={handleAccountForm}
            />
            <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 w-full"
              type="number"
              name="balance"
              value={accountForm.balance}
              placeholder="Initial Balance"
              onChange={handleAccountForm}
            />
            <button
              className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3"
              onClick={addNewAccount}
            >
              Save Account
            </button>
            <button
              className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5"
              onClick={() => setNewAccount(false)}
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BalancePage;