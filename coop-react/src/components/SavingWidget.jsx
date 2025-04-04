import React from 'react'
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const SavingWidget = ({progress}) => {
    const red = Math.round((progress / 100) * 255);
    const green = Math.round((1 - progress / 100) * 255);
    const color = `rgb(${red}, ${green}, 0)`
    
    return (
    <div>
        <div className='flex flex-row items-center'>
            <div className='flex flex-col items-center justify-center bg-gray-700 w-180 h-35 my-3 mr-5 p-1 rounded-3xl '>
                <div className='flex flex-row items-center w-full h-15 p-5'>
                    <div className='text-2xl w-85'>The Weeknd Tickets</div>
                    <div className='text-xl w-85'>Add $10 Every Month</div>
                    <div className='text-xl w-15'>{progress}%</div>
                </div>
                <div className='w-full h-15 m-5 px-5'>
                    <div className='w-full h-full bg-gray-600 rounded-2xl'>
                        <div className='h-full bg-green-600 rounded-2xl' style={{ width: `${progress}%`}}></div>
                    </div>
                </div>
            </div>
            
            <div className='flex items-center justify-center bg-gray-500 rounded-full w-15 h-15 mr-5'><MdEdit size={40} /></div>
            <div className='flex items-center justify-center bg-gray-500 rounded-full w-15 h-15 mr-5'><FaTrash size={30} /></div>
        </div>
    </div>
  )
}

export default SavingWidget
 