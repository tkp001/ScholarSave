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

  const [animateKey, setAnimateKey] = useState(0); // State to trigger animation

  // function toastMessage(message, type) {
  //   if (type === "error") {
  //     toast.error(message, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: false,
  //       pauseOnHover: true,
  //       draggable: false,
  //       progress: undefined,
  //       theme: "colored",
  //     });
  //   } else if (type === "success") {
  //     toast.success(message, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: false,
  //       pauseOnHover: true,
  //       draggable: false,
  //       progress: undefined,
  //       theme: "colored",

  //     });
  //   } else if (type === "warning") {
  //     toast.warn(message, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: false,
  //       pauseOnHover: true,
  //       draggable: false,
  //       progress: undefined,
  //       theme: "colored",
  //     });
  //   } else {
  //     toast(message, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: false,
  //       pauseOnHover: true,
  //       draggable: false,
  //       progress: undefined,
  //       theme: "colored",
  //     });
  //   }
  // }

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

  useEffect(() => {
    if (viewedAccount) {
      fetchLastTransaction(viewedAccount.last_transaction);
      setAnimateKey((prevKey) => prevKey + 1); // Update the animation key
    }
  }, [viewedAccount]);

  const handleAccountForm = (e) => {
    const { name, value } = e.target;
    setAccountForm((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const addNewAccount = async () => {
    if (!accountForm.nickname || !accountForm.account_number || !accountForm.balance) {
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
    <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white">
      <div className="flex flex-col w-full h-400 p-10">
        <AccountViewer />

        {viewedAccount ? (
          <div
            key={animateKey} // Use the animation key to re-render the div
            className="flex flex-col stagger-container"
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
          <div className="text-xl my-2 mb-10 fade-in">Please select an account to view details.</div>
        )}

        {viewedAccount && (
          <button
              className="w-fit h-8 bg-red-600 rounded-4xl px-2 my-5 scale-on-hover"
              onClick={deleteAccount}
            >
              Unlink Account
          </button>
        )}

        <button
          className="w-fit min-h-8 h-8 bg-green-600 rounded-4xl px-2 mr-3 scale-on-hover"
          onClick={() => setNewAccount(!newAccount)}
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