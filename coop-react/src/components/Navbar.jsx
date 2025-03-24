import React from 'react'
import App from '../App'
import { Navigate, Link } from 'react-router-dom'

const Navbar = () => { 
  return (
    <>
        <div className='flex flex-col w-60 h-screen p-4 bg-gray-700 text-white text-2xl '>
          <div className='mb-10'>LOGO</div>
          <Link to='/'  className='mb-2'>Analytics</Link>
          <Link to='/expenses' className='mb-2'>Expenses</Link>
          <Link to='/income'className='mb-2'>Income</Link>
          <Link to='/allowance' className='mb-2'>Allowance</Link>
          <Link to='/learning' className='mb-2'>Learning</Link>
          <Link to='/tools' className='mb-2'>Tools</Link>
          <Link to='/settings' className='mb-2'>Settings</Link>


        </div>
        
    
    
    </>
  )
}

export default Navbar