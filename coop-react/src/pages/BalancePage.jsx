import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import UserContext from '../UserContext';
import AccountViewer from '../components/AccountViewer';
import '../App.css';
import { PulseLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const BalancePage = () => {
  const { user } = useContext(UserContext);
  const { viewedAccount } = useContext(UserContext);
  const { accounts } = useContext(UserContext);
  const { updateViewedAccount } = useContext(UserContext);
  const [lastTransactionDetails, setLastTransactionDetails] = useState(null);
  const { fetchAccounts } = useContext(UserContext);
  const { toastMessage } = useContext(UserContext);

  const [newAccount, setNewAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    account_number: "",
    balance: 0,
    nickname: "",
    status: "active",
    user_id: user.uid,
    last_modified: new Date().toLocaleString(),
    last_transaction: "N/A",
  });

  /**
   * Resets the account form to its initial state and toggles the new account form visibility.
   */
  function resetAccountForm() {
    setNewAccount(!newAccount)
    setAccountForm({
      account_number: "",
      balance: 0,
      nickname: "",
      status: "active",
      user_id: user.uid,
      last_modified: new Date().toLocaleString(),
      last_transaction: "N/A",
    });
  }

  const [animateKey, setAnimateKey] = useState(0); // State to trigger animation

  /**
   * Fetches the details of the last transaction for the given transaction ID.
   * @param {string} transactionId - The ID of the transaction to fetch.
   */
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
      toastMessage("Error fetching transaction details", "error");
      setLastTransactionDetails(null);
    }
  }

  /**
   * Fetch last transaction details and trigger animation when viewedAccount changes.
   */
  useEffect(() => {
    if (viewedAccount) {
      fetchLastTransaction(viewedAccount.last_transaction);
      setAnimateKey((prevKey) => prevKey + 1); // Update the animation key
    }
  }, [viewedAccount]);

  /**
   * Handles changes to the account form input fields.
   * @param {object} e - The input change event.
   */
  const handleAccountForm = (e) => {
    const { name, value } = e.target;
    setAccountForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * Adds a new account to the database using the current form data.
   */
  const addNewAccount = async () => {
    if (!accountForm.nickname || !accountForm.account_number || accountForm.balance === "") {
      toastMessage("All fields are required", "warning");
    } else {
      try {
        const accountsRef = collection(db, "accounts");
        await addDoc(accountsRef, accountForm);
        toastMessage("New account added successfully!", "success");
        setNewAccount(false);
        fetchAccounts();
      } catch (error) {
        console.error("Error adding new account: ", error);
        toastMessage("Error adding new account", "error");
      }
    }
  };

  /**
   * Deletes the currently viewed account after user confirmation.
   */
  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the account "${viewedAccount.account_number}"? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        const accountDocRef = doc(db, "accounts", viewedAccount.id);
        await deleteDoc(accountDocRef);
        toastMessage("Account deleted successfully!", "success");
        updateViewedAccount(null);
        fetchAccounts();
      } catch (error) {
        console.error("Error deleting account: ", error);
        toastMessage("Error deleting account", "error");
      }
    }
  };

  return (
    <div className="flex flex-row flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col flex-grow p-10">
        <AccountViewer />
        
        <div className='flex flex-row max-w-200'>
          {viewedAccount ? (
            <div
              key={animateKey} // Use the animation key to re-render the div
              className="flex flex-col flex-grow stagger-container"
            >
              <div className="text-3xl fade-in">Total Balance</div>
              <div className="text-5xl mb-10 fade-in">${parseFloat(viewedAccount.balance).toFixed(2)}</div>

              <div className="text-3xl fade-in">Last Modified</div>
              <div className="text-2xl mb-10 fade-in">{viewedAccount.last_modified}</div>

              <div className="text-3xl fade-in">Last Transaction</div>
              {lastTransactionDetails ? (
                <>
                  <div className="text-2xl mb-10 fade-in">
                    <p className="text-sm">ID: {viewedAccount.last_transaction}</p>
                    <p>Name: {lastTransactionDetails.name}</p>
                    <p>Amount: ${lastTransactionDetails.amount}</p>
                    <p>Category: {lastTransactionDetails.category}</p>
                  </div>
                </>
              ) : (
                <div className="text-2xl mb-10 fade-in">No transaction details available.</div>
              )}
            </div>
          ) : (   
            <div className="flex text-xl my-2 mb-5 fade-in">Please select an account to view details.</div>
          )}

          <div className="flex flex-col max-w-100 min-w-60 w-100 p-4 h-full stagger-container">
          {accounts.length > 0 ? (
            <div className="text-xl mb-3 fade-in">Your Accounts</div>
            ) : (
            <div></div>)
          }

          {accounts.slice(0, 5).map((acc) => (
            <div key={acc.id} className="mb-3 p-2 bg-gray-700 rounded-xl" onClick={() => updateViewedAccount(acc)}>
              <div className="font-semibold">{acc.nickname}</div>
              <div className="text-xs text-gray-300">#{acc.account_number}</div>
              <div className="text-sm">Balance: ${parseFloat(acc.balance).toFixed(2)}</div>
            </div>
          ))}
        </div>
      
      </div>

        {viewedAccount && (
          <button
              className="w-fit min-h-8 h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
              onClick={deleteAccount}
            >
              Unlink Account
          </button>
        )}

        <button
          className="w-fit min-h-8 h-8 bg-green-600 rounded-4xl px-2 mr-3 scale-on-hover"
          onClick={() => resetAccountForm()}
        >
          + New Account
        </button>

        {newAccount && (
          <div className="bg-gray-700 w-100 p-5 my-5 rounded-xl fade-in">
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
              className="w-fit h-8 bg-blue-600 rounded-4xl px-2 my-5 mr-3 scale-on-hover"
              onClick={addNewAccount}
            >
              Save Account
            </button>
            <button
              className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
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