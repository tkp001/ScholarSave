import React from 'react'
import { SiSemanticscholar } from "react-icons/si";
import '../App.css';
import { Navigate, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { useEffect, useState } from 'react'
import UserContext from '../UserContext'

import { getAuth, onAuthStateChanged } from 'firebase/auth'


const AuthService = ({children}) => {
    const auth = getAuth();
    const location = useLocation();


    const { user, updateUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            console.log(uid, "signed in")
            console.log(user)
            updateUser(user)
            // ...
          } else {
            // User is signed out
            console.log("signed out")
            updateUser(null)
            // ...
          }
          setLoading(false);
        });
      }, [auth, updateUser, loading]);
    
    if (loading) {
      return <div className='flex bg-black text-white w-screen h-screen justify-center items-center'>
        <div className="py-2 animate-float">
          <SiSemanticscholar size={300} />
        </div>
      </div>;
    }

    if (!user && location.pathname !== '/auth') {
      return <Navigate to="/auth" />;
    }

    if (user && location.pathname == '/auth') {
      return <Navigate to="/" />;
    }

    return (
      // auth provider using createcontext
    <>
      {children}
    </>)
}

export default AuthService