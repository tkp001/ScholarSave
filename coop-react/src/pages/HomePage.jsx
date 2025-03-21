import React from 'react'
import { useContext } from 'react'
import UserContext from '../UserContext'

const HomePage = () => {
  const {user} = useContext(UserContext)


  return (
    <>
      <div>HomePage</div>
      {user ? <div>{user.email}</div> : <div>Logged out</div>}
      {/* {user && user.reloadUserInfo.emailVerified? <div>true</div> : <div>false</div>} */}
    
    </>
    )
  }
  


export default HomePage