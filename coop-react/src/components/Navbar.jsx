import React from 'react'
import App from '../App'
import { Navigate, Link, NavLink } from 'react-router-dom'
import { SiGoogleanalytics } from "react-icons/si";

import { SiSemanticscholar } from "react-icons/si";
import { AiFillBank } from "react-icons/ai";
import { FaMoneyBills } from "react-icons/fa6";
import { FaPiggyBank } from "react-icons/fa6";
import { FaBook } from "react-icons/fa6";
import { FiTool } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";



const Navbar = () => { 
  const activeLink = ({isActive}) =>
    isActive
      ? "flex flex-row items-center text-gray-900 hover:text-gray-800"
      : "flex flex-row items-center hover:text-gray-800";
      
    
    return (
    <>
        <div className='flex flex-col w-60 h-screen p-4 bg-gray-700 text-white text-2xl '>
          <div className='mb-10'><SiSemanticscholar size={70}/></div>
          <NavLink to='/' target="_self" className={activeLink}><SiGoogleanalytics className='mr-4 my-2'/>Analytics</NavLink>
          <NavLink to='/expenses' target="_self" className={activeLink}><AiFillBank className='mr-4 my-2'/>Expenses</NavLink>
          <NavLink to='/income'target="_self" className={activeLink}><FaMoneyBills className='mr-4 my-2'/>Income</NavLink>
          <NavLink to='/allowance' target="_self" className={activeLink}><FaPiggyBank className='mr-4 my-2'/>Allowance</NavLink>
          <NavLink to='/learning' target="_self" className={activeLink}><FaBook className='mr-4 my-2'/>Learning</NavLink>
          <NavLink to='/tools' target="_self" className={activeLink}><FiTool className='mr-4 my-2'/>Tools</NavLink>
          <NavLink to='/settings' target="_self" className={activeLink}><IoMdSettings className='mr-4 my-2' />Settings</NavLink>


        </div>
        
    
    
    </>
  )
}

export default Navbar