import React from 'react';
import '../App.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, sendPasswordResetEmail, sendEmailVerification} from "firebase/auth";
import { useState, useContext, useEffect } from 'react';
import UserContext from '../UserContext';
import { SiSemanticscholar } from "react-icons/si";
import { toast } from 'react-toastify';
import { PulseLoader } from 'react-spinners';

const AuthPage = () => {
  const auth = getAuth();
  const { user, setUser } = useContext(UserContext);
  const {toastMessage} = useContext(UserContext);
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authErrorMessage, setAuthErrorMessage] = useState(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  /**
   * Sign out the current user and handle errors.
   */
  function authSignout() {
    signOut(auth).then(() => {
      console.log("Signed out successfully");
    }).catch((error) => {
      console.error("Error signing out:", error);
      toastMessage("Error signing out!", "error");
    });
  }

  /**
   * Register a new user with email and password, send verification email, and handle errors.
   */
  function authSignupPassword() {
    setAuthErrorMessage(null);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
        toastMessage("Account created successfully!", "success");
        // Send verification email
        sendEmailVerification(userCredential.user)
          .then(() => {
            toastMessage("Verification email sent! Please check your inbox.", "success");
          })
          .catch((error) => {
            setAuthMessage(error.code, error.message);
            toastMessage("Error sending verification email!", "error");
          });
      })
      .catch((error) => {
        console.error(error.code, error.message);
        setAuthMessage(error.code, error.message);
      });
  }

  /**
   * Sign in a user with email and password and handle errors.
   */
  function authSigninPassword() {
    setAuthErrorMessage(null);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
      })
      .catch((error) => {
        console.error(error.code, error.message);
        setAuthMessage(error.code, error.message);
      });
  }

  /**
   * Sign in a user with Google popup and handle errors.
   */
  function authGoogleSigninPopup() {
    setAuthErrorMessage(null);
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error.code, error.message);
        setAuthMessage(error.code, error.message);
      });
  }

  /**
   * Set the authentication error message based on error code and message.
   * @param {string} code - The error code from Firebase Auth.
   * @param {string} message - The error message from Firebase Auth.
   */
  function setAuthMessage(code, message) {
    switch (code) {
      case 'auth/invalid-email':
        setAuthErrorMessage("Invalid email address.");
        toastMessage("Invalid email address.", "error");
        break;
      case 'auth/missing-password':
        setAuthErrorMessage("Password is required.");
        toastMessage("Password is required.", "error");
        break;
      case 'auth/missing-email':
        setAuthErrorMessage("Email is required.");
        toastMessage("Email is required.", "error");
        break;
      case 'auth/weak-password':
        setAuthErrorMessage("Password should be at least 6 characters.");
        toastMessage("Password should be at least 6 characters.", "error");
        break;
      case 'auth/invalid-credential':
        setAuthErrorMessage("Invalid credentials.");
        toastMessage("Invalid credentials.", "error");
        break;
      default:
        setAuthErrorMessage(message);
    }
  }

  /**
   * Send a sign-in link to the user's email for email link authentication.
   */
  function sendEmailLink() {
    setAuthErrorMessage(null);
    const actionCodeSettings = {
      url: `${window.location.origin}/auth`, // Redirect URL
      handleCodeInApp: true,
    };
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email);
        setEmailLinkSent(true);
        toastMessage("Sign-in link sent! Check your email.", "success");
      })
      .catch((error) => {
        setAuthMessage(error.code, error.message);
      });
  }

  /**
   * Check for email link sign-in on mount and handle sign-in if present.
   */
  useEffect(() => {
    console.log("Checking for email link sign-in...");
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        toastMessage("No email found for sign-in.", "error");
        return;
      }
      signInWithEmailLink(auth, emailForSignIn, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          setUser(result.user);
          toastMessage("Signed in successfully!", "success");
        })
        .catch((error) => {
          setAuthMessage(error.code, error.message);
        });
    }
  }, [auth, setUser]);

  /**
   * Send a password reset email to the user and handle errors.
   */
  function handlePasswordReset() {
    setAuthErrorMessage(null);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResetEmailSent(true);
        toastMessage("Password reset email sent! Check your inbox.", "success");
      })
      .catch((error) => {
        setAuthMessage(error.code, error.message);
      });
  }

  return (
    <div className='bg-gray-700'>
      <div className="flex flex-row w-screen h-screen items-center justify-center bg-gray-700">
        <div className='flex flex-col w-200 h-full items-center justify-center text-white stagger-container'>
          <div className='text-6xl'>ScholarSave</div>
          <div className='text-2xl w-100 text-center my-2'>Student Financial Management Tool & Education AI Tool</div>
          <div className='font-semibold italic text-xl'>“Smart Finance, Simplified for Students”</div>

          {/* Floating Icon */}
          <div className="py-2 animate-float">
            <SiSemanticscholar size={300} />
          </div>
        </div>
        
        
        <div className='flex flex-col w-200 h-full items-center justify-center p-10 text-white stagger-container'>
          {/* Floating Icon
          <div className="py-2 animate-float">
            <SiSemanticscholar size={230} />
          </div> */}

          {/* Heading */}
          <h1 className="text-6xl tracking-tighter text-balance mb-10">
            {user ? `Welcome ${user.displayName}` : "Sign In / Sign Up"}
          </h1>

          {!user ? (
            <>
              {/* Input Fields */}
              <div className="flex flex-col items-center">
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 scale-on-hover"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="border-2 border-gray-500 rounded-xl m-1 p-1 scale-on-hover"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div>
                  {authErrorMessage && (
                    <div className='text-red-500 stagger-container'>{authErrorMessage}</div>
                  )}
                </div>
                <div>
                  <div className='flex flex-row items-center'>
                    <button
                      className="m-1 px-3 rounded-xl bg-gray-500 scale-on-hover"
                      onClick={authSignupPassword}
                    >
                      Register
                    </button>
                    <button
                      className="m-1 px-3 rounded-xl bg-gray-500 scale-on-hover"
                      onClick={authSigninPassword}
                    >
                      Log In
                    </button>
                  </div>
                  
                  {email && (
                    <div className='fade-in flex flex-col items-center'> 
                      <button
                        className="mt-1 px-1 rounded-xl bg-gray-500 scale-on-hover"
                        onClick={sendEmailLink}
                        disabled={!email}
                      >
                        Sign in with Email Link
                      </button>
                      <button
                        className="mt-1 px-1 rounded-xl bg-red-600 scale-on-hover"
                        onClick={handlePasswordReset}
                        disabled={!email}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
                <PulseLoader 
                  className='my-4'
                  color="white"
                  loading={user}
                  size={15}
                />
              </div>

              {/* OR Divider */}
              <h1 className="text-xl tracking-tighter text-balance m-4">
                OR
              </h1>

              {/* Google Sign-In Button */}
              <div>
                <button
                  className="flex flex-row items-center p-1 bg-blue-500 rounded-xl scale-on-hover"
                  onClick={authGoogleSigninPopup}
                >
                  <img
                    className="h-10 p-1 bg-white rounded-lg"
                    src="https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-512.png"
                    alt="Google Logo"
                  />
                  <p className="mx-4 text-white">Sign in with Google</p>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Signed-In Actions
              <button
                className="mt-2 m-1 px-3 rounded-xl bg-gray-500 scale-on-hover"
                onClick={authSignout}
              >
                YOU ARE SIGNED IN | SIGN OUT
              </button>
              <a
                className="mt-2 m-1 px-3 rounded-xl bg-gray-500 scale-on-hover"
                href={window.location.origin}
              >
                Go to HomePage
              </a> */}
            </>
          )}

        </div>
        
      </div>
    </div>
  );
};

export default AuthPage;