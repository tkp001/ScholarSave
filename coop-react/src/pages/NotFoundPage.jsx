import React from 'react'
import '../App.css';
import { useContext } from 'react';
import UserContext from '../UserContext';
import { FaRegQuestionCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';


const NotFoundPage = () => {
  const {toastMessage} = useContext(UserContext);
  return (
    <>
      <div className='flex flex-grow flex-col items-center justify-center bg-gray-800 text-white stagger-container'>
        <FaRegQuestionCircle color='white' size={200} className='mx-5 my-5 animate-float'/>
        <h1 className='flex p-5 text-5xl'>404 Invalid Page</h1>
        <div className='flex'>
          <Link to='/' className='text-2xl scale-on-hover'>Return to Home</Link>
        </div>
      </div>
    
    </>
  )
}

export default NotFoundPage