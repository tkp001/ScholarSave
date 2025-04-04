import React from 'react'
import { SiSemanticscholar } from "react-icons/si";

import { useContext } from 'react'
import UserContext from '../UserContext'


const SettingsPage = () => {
  const { user } = useContext(UserContext)
  
  return (
    <>
      <div className='flex flex-grow flex-nowrap overflow-y-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col w-full p-10">
          <div className='flex flex-row'>
            <div className='flex flex-col w-100 min-w-100'>
              <div className='text-5xl mb-2'>{user.displayName}</div>
              <div className='text-sm'>{`USER ID: ${user.uid}`}</div>
              <div className='text-sm'>{`Created On: ${user.metadata.creationTime}`}</div>
              <div className='text-sm'>{`Last Signed In: ${user.metadata.lastSignInTime}`}</div>

              <div className='text-4xl my-4'>Account & Safety</div>
              <div className='text-md mb-5'>{`Email: ${user.email}`}</div>
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={console.log("click")}>Change Email</div>
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={console.log("click")}>Change Password</div>
              <div className='flex flex-col justify-center bg-gray-700 w-fit p-2 h-8 rounded-xl my-1' onClick={console.log("click")}>Logout</div>
              
              <div className='flex flex-col justify-center bg-red-700 w-fit p-2 h-8 rounded-xl my-1' onClick={console.log("click")}>Delete Account</div>
              <div className='flex flex-col justify-center bg-red-700 w-fit p-2 h-8 rounded-xl my-1' onClick={console.log("click")}>Delete Data</div>

              <div className='text-4xl mt-10 my-4'>Customization</div>
              <div className='flex flex-row items-center my-1'>
                <div className='text-2xl w-70'>Night Mode</div>
                <input type="checkbox" className="" checked={true} onChange={console.log("click")}/>
              </div>
              <div className='flex flex-row items-center my-1'>
                <div className='text-2xl w-70'>Budget Warnings</div>
                <input type="checkbox" className="" checked={true} onChange={console.log("click")}/>
              </div>
              
            </div>
            
            <div className='pl-30'><SiSemanticscholar size={700}/></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage