import React from 'react'
import { Outlet } from 'react-router-dom';
import AuthService from '../utils/AuthService';


const MainLayout = () => {
  return (
    <>
        <AuthService><Outlet /></AuthService>      
    </>
  );
};
export default MainLayout