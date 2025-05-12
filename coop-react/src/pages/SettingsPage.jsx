import React, { useContext, useState } from 'react';
import { getAuth, signOut, updateEmail, sendPasswordResetEmail, updatePassword, sendEmailVerification, deleteUser, updateProfile } from "firebase/auth";
import { SiSemanticscholar } from "react-icons/si";
import UserContext from '../UserContext';

const SettingsPage = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  function sendUserEmailVerification() {
    sendEmailVerification(auth.currentUser);
    setVerificationEmailSent(true);
    alert("Verification email sent to " + user.email);
  }

  function authSignout() {
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

  function endService() {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      deleteUser(user).then(() => {
        alert("User deleted. Thank you for using our service!");
      }).catch((error) => {
        // An error occurred
      });
    }
  }

  function handleChangeEmail() {
    const newEmail = prompt("Enter your new email address:");
    const confirmChange = confirm(`Are you sure you want to change your email to ${newEmail}?`);
    if (newEmail && confirmChange) {
      updateEmail(auth.currentUser, newEmail).then(() => {
        alert("Email updated!");
      }).catch((error) => {
        // An error occurred
      });
    }
  }

  function handlePasswordChange() {
    const confirmChange = confirm("Would you like to reset your password via EMAIL?");
    if (confirmChange) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          alert("A password reset email will be sent to " + user.email);
        })
        .catch((error) => {
          // Handle error
        });
    } else {
      const newPassword = prompt("Enter your new password:");
      const confirmChange = confirm(`Is ${newPassword} ok?`);
      if (newPassword && confirmChange) {
        updatePassword(user, newPassword).then(() => {
          alert("Password updated!");
        }).catch((error) => {
          // Handle error
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
        alert("Name updated!");
      }).catch((error) => {
        // Handle error
      });
    }
  }

  return (
    <>
      <div className="flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white stagger-container">
        <div className="flex flex-col w-full p-10 stagger-container">
          <div className="flex flex-row">
            <div className="flex flex-col w-100 min-w-100">
              <div className="text-5xl mb-2 fade-in">{user.displayName}</div>
              <div className="text-sm fade-in">{`USER ID: ${user.uid}`}</div>
              <div className="text-sm fade-in">{`Created On: ${user.metadata.creationTime}`}</div>
              <div className="text-sm fade-in">{`Last Signed In: ${user.metadata.lastSignInTime}`}</div>

              <div className="text-4xl my-4 fade-in">Account & Safety</div>
              <div className="text-md mb-5 fade-in">{`Email: ${user.email}`}</div>
              {!user.emailVerified && !verificationEmailSent ? (
                <div
                  className="flex flex-col justify-center bg-yellow-500 w-fit p-2 h-8 rounded-xl my-1 scale-on-hover"
                  onClick={sendUserEmailVerification}
                >
                  Verify Email
                </div>
              ) : null}
              <div
                className="flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1 scale-on-hover"
                onClick={handleNameChange}
              >
                Change Name
              </div>
              <div
                className="flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1 scale-on-hover"
                onClick={handleChangeEmail}
              >
                Change Email
              </div>
              <div
                className="flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1 scale-on-hover"
                onClick={handlePasswordChange}
              >
                Reset Password
              </div>
              <div
                className="flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1 scale-on-hover"
                onClick={authSignout}
              >
                Logout
              </div>

              <div
                className="flex flex-col justify-center bg-red-700 w-fit p-2 h-8 rounded-xl my-1 scale-on-hover"
                onClick={endService}
              >
                Delete Account
              </div>
            </div>

            <div className="pl-30 float-right">
              <SiSemanticscholar size={700} className="animate-float" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;