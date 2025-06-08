import React, { useContext, useState } from 'react';
import { getAuth, signOut, updateEmail, sendPasswordResetEmail, updatePassword, sendEmailVerification, deleteUser, updateProfile } from "firebase/auth";
import { SiSemanticscholar } from "react-icons/si";
import UserContext from '../UserContext';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const { toastMessage } = useContext(UserContext);

  /**
   * Send a verification email to the user's email address.
   */
  function sendUserEmailVerification() {
    sendEmailVerification(auth.currentUser);
    setVerificationEmailSent(true);
    toastMessage("Verification email sent!", "success");
  }

  /**
   * Sign out the current user and show a toast message.
   */
  function authSignout() {
    signOut(auth).then(() => {
      toastMessage("Signed out successfully!", "success");
    }).catch((error) => {
      toastMessage("Error signing out!", "error");
    });
  }

  /**
   * Delete the user's account after confirmation.
   */
  function endService() {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      deleteUser(user).then(() => {
        toastMessage("Account deleted successfully!", "success");
      }).catch((error) => {
        toastMessage("Error deleting account!", "error");
      });
    }
  }

  /**
   * Prompt the user to change their email and update it in Firebase Auth.
   */
  function handleChangeEmail() {
    const newEmail = prompt("Enter your new email address:");
    const confirmChange = confirm(`Are you sure you want to change your email to ${newEmail}?`);
    if (newEmail && confirmChange) {
      updateEmail(auth.currentUser, newEmail).then(() => {
        toastMessage("Email updated successfully!", "success");
      }).catch((error) => {
        toastMessage("Error updating email!", "error");
      });
    }
  }

  /**
   * Prompt the user to reset or change their password and update it in Firebase Auth.
   */
  function handlePasswordChange() {
    const confirmChange = confirm("Would you like to reset your password via EMAIL?");
    if (confirmChange) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          toastMessage("Password reset email sent!", "success");
        })
        .catch((error) => {
          toastMessage("Error sending password reset email!", "error");
        });
    } else {
      const newPassword = prompt("Enter your new password:");
      const confirmChange = confirm(`Is ${newPassword} ok?`);
      if (newPassword && confirmChange) {
        updatePassword(user, newPassword).then(() => {
          toastMessage("Password updated successfully!", "success");
        }).catch((error) => {
          toastMessage("Error updating password!", "error");
        });
      }
    }
  }

  /**
   * Prompt the user to change their display name and update it in Firebase Auth.
   */
  function handleNameChange() {
    const name = prompt("Enter your new name:");
    const confirmChange = confirm(`Is ${name} ok?`);
    if (name && confirmChange) {
      updateProfile(auth.currentUser, {
        displayName: name,
      }).then(() => {
        toastMessage("Name updated successfully!", "success");
      }).catch((error) => {
        toastMessage("Error updating name!", "error");
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