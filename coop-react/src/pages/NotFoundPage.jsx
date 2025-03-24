import React from 'react'
import { FaRegQuestionCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';


const NotFoundPage = () => {
  return (
    <>
      <div className='flex flex-grow flex-col items-center justify-center bg-gray-800 text-white'>
        <h1 className='flex p-5 text-5xl'>404 Invalid Page<FaRegQuestionCircle color='white' size={50} className='mx-5' /></h1>
        <Link to='/' className='text-2xl'>Return to Home</Link>
        



      </div>
    
    </>
  )
}

export default NotFoundPage