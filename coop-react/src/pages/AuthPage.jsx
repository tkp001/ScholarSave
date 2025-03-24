import React from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { signOut } from "firebase/auth";

import { useState, useContext } from 'react';
import UserContext from '../UserContext';
import { Navigate } from 'react-router-dom';

//currently only page that uses firebase auth commands

const AuthPage = () => {
  const auth = getAuth();
  const { user, setUser } = useContext(UserContext);
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  function authSignout() {
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
    
  }
  
  function authSignupPassword() {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      // const user = userCredential.user;
      console.log(user)
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage)
      // ..
    });
  }

  function authSigninPassword() {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      // const user = userCredential.user;
      console.log(user)
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage)
      
    });
  }

  function authGoogleSigninPopup() {
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }

  // if (user) {
  //   return <Navigate to="/"/>
  // }

  return (
    <>
    <div className='flex flex-col w-screen h-screen items-center p-10'>
      <h1 className='text-6xl tracking-tighter text-balance mb-10'>{user ? `Welcome ${user.displayName}` : "Sign In / Sign Up"}</h1>

      {user ? null :
      
      <>
        <div>
        <input
          className='border-2 border-gray-500 rounded-xl m-1 p-1'
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='border-2 border-gray-500 rounded-xl m-1 p-1'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button className='m-1 px-3 rounded-xl bg-gray-500' onClick={authSignupPassword}>Register</button>
          <button className='m-1 px-3 rounded-xl bg-gray-500'  onClick={authSigninPassword}>Log In</button>
        </div>
        
        

        
      </div>
      <h1 className='text-xl tracking-tighter text-balance m-4'>OR</h1>
     
      <div></div>
      <button className='flex flex-row items-center p-1 bg-blue-500 rounded-xl' onClick={authGoogleSigninPopup}>
        <img className='h-10 p-1 bg-white rounded-lg' src='https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-512.png' />
        <p className='mx-4 text-white'>Sign in with Google</p>
      
      </button>
      </>
      
      } 

      {user ? <button className='mt-2 m-1 px-3 rounded-xl bg-gray-500' onClick={authSignout}>YOU ARE SIGNED IN | SIGN OUT</button> : <div className='m-10'>Not Signed In.</div>}

    </div>
      
      
    </>
  )
}

export default AuthPage