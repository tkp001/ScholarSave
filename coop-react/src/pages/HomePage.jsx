import React from 'react'
import { useContext } from 'react'
import UserContext from '../UserContext'
import { Navigate } from 'react-router-dom'

const HomePage = () => {
  const { user } = useContext(UserContext)
  
  return (
    <>
      <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col w-full h-400 p-10">
          <div className='text-3xl'>Welcome {user.displayName}</div>
          <div className='flex flex-col bg-gray-700  w-200 h-100 rounded-3xl my-5 p-5'></div>
          <div className='flex flex-row'>
            <div className='flex flex-col bg-gray-700  w-100 h-100 rounded-3xl mr-5 p-5'></div>
            <div className='flex flex-col bg-gray-700  w-100 h-100 rounded-3xl p-5'></div>
          </div>
          <div className='flex flex-col bg-gray-700  w-200 h-100 rounded-3xl my-5 p-5'></div>
        </div>
      </div>
    </>
    )
  }
  


export default HomePage