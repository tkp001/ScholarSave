import React from 'react'
import { getAuth, signOut, updateEmail, sendPasswordResetEmail, updatePassword, sendEmailVerification, deleteUser, updateProfile } from "firebase/auth";
import { SiSemanticscholar } from "react-icons/si";

import { useContext, useState } from 'react'
import UserContext from '../UserContext'
import { Navigate } from 'react-router-dom';


const SettingsPage = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [verificationEmailSent, setVerificationEmailSent] = useState(false)
  
  function sendUserEmailVerification() {
    sendEmailVerification(auth.currentUser)
    verificationEmailSent(true)
    alert("Verification email sent to " + user.email)
  }

  function authSignout() {
      signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      });
      
  }

  function endService() {
    //DELETE ALL USER DATA FIRST
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      deleteUser(user).then(() => {
        // User deleted.
        alert("User deleted. Thank you for using our service!")
      }).catch((error) => {
        // An error ocurred
        // ...
      });
    }
  }

  function handleChangeEmail() {
    const newEmail = prompt("Enter your new email address:");
    const confirmChange = confirm(`Are you sure you want to change your email to ${newEmail}?`);
    if (newEmail && confirmChange) {
      updateEmail(auth.currentUser, newEmail).then(() => {
        // Email updated!
        // ...
        alert("Email updated!")
      }).catch((error) => {
        // An error occurred
        // ...
      });
    }
  }

  function handlePasswordChange() {
    const confirmChange = confirm("Would you like to reset your password via EMAIL?");
    if (confirmChange) {
      sendPasswordResetEmail(auth, user.email)
    .then(() => {
      // Password reset email sent!
      // ..
      alert("A password reset email will be sent to " + user.email)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
    } else {
      const newPassword = prompt("Enter your new password:");
      const confirmChange = confirm(`Is ${newPassword} ok?`);
      if (newPassword && confirmChange) {
        updatePassword(user, newPassword).then(() => {
          // Update successful.
          alert("Password updated!")
        }).catch((error) => {
          // An error ocurred
          // ...
        });
      }
    }
  }

  function handleNameChange() {
    const name = prompt("Enter your new name:");
    const confirmChange = confirm(`Is ${name} ok?`);
    if (name && confirmChange) {
      updateProfile(auth.currentUser, {
        displayName: name,
      }).then(() => {
        // Profile updated!
        // ...
        alert("Name updated!")
      }).catch((error) => {
        // An error occurred
        // ...
      });
    }
  }
  return (
    <>
      <div className='flex flex-grow flex- overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col w-full p-10">
          <div className='flex flex-row'>
            <div className='flex flex-col w-100 min-w-100'>
              <div className='text-5xl mb-2'>{user.displayName}</div>
              <div className='text-sm'>{`USER ID: ${user.uid}`}</div>
              <div className='text-sm'>{`Created On: ${user.metadata.creationTime}`}</div>
              <div className='text-sm'>{`Last Signed In: ${user.metadata.lastSignInTime}`}</div>

              <div className='text-4xl my-4'>Account & Safety</div>
              <div className='text-md mb-5'>{`Email: ${user.email}`}</div>
              {!user.emailVerified && !verificationEmailSent ? <div className='flex flex-col justify-center bg-yellow-500 w-fit p-2 h-8 rounded-xl my-1' onClick={sendUserEmailVerification}>Verify Email</div> : null}
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={handleNameChange}>Change Name</div>
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={handleChangeEmail}>Change Email</div>
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={handlePasswordChange}>Reset Password</div>
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={authSignout}>Logout</div>
              
              <div className='flex flex-col justify-center bg-red-700 w-fit p-2 h-8 rounded-xl my-1' onClick={endService}>Delete Account</div>
              <div className='flex flex-col justify-center bg-red-700 w-fit p-2 h-8 rounded-xl my-1' onClick={() => console.log("click")}>Delete Data</div>

              {/* <div className='text-4xl mt-10 my-4'>Customization</div>
              <div className='flex flex-row items-center my-1'>
                <div className='text-2xl w-70'>Night Mode</div>
                <input type="checkbox" className="" checked={true} onChange={() => console.log("click")}/>
              </div>
              <div className='flex flex-row items-center my-1'>
                <div className='text-2xl w-70'>Budget Warnings</div>
                <input type="checkbox" className="" checked={true} onChange={() =>  console.log("click")}/>
              </div> */}
              
            </div>
            
            <div className='pl-30'><SiSemanticscholar size={700}/></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage