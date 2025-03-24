import React from 'react'
import { useContext } from 'react'
import UserContext from '../UserContext'
import { Navigate } from 'react-router-dom'

const HomePage = () => {
  const { user } = useContext(UserContext)
  
  return (
    <>
      <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col w-full p-10">
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
          <div className='text-4xl'>{`Hi ${user.displayName}!`}</div>
        </div>
      </div>
    </>
    )
  }
  


export default HomePage