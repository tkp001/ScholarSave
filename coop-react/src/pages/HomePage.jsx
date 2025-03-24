import React from 'react'
import { useContext } from 'react'
import UserContext from '../UserContext'

const HomePage = () => {
  const {user} = useContext(UserContext)


  return (
    <>
    <div className='flex flex-col flex-grow bg-yellow-400'>


    </div>
    
    </>
    )
  }
  


export default HomePage