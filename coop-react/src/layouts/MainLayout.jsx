import React from 'react'
import { Outlet } from 'react-router-dom';
import AuthService from '../utils/AuthService';
import Navbar from '../components/Navbar';

import { useContext } from 'react';
import UserContext from '../UserContext';

const MainLayout = () => {
  const {user} = useContext(UserContext);

  return (
    <>
        <AuthService>
          <div className='flex flex-grow flex-row w-screen h-screen'>

            {location.pathname !== '/auth' && user ? 
            
            
            
            <Navbar /> 
            
            
            
            
            : null}
            
            <Outlet />

          </div>
          
        </AuthService>      
    </>
  );
};
export default MainLayout