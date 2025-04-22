import React from 'react'
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";


const BudgetWidget = ({
  budget, 
  name="name", 
  category="category", 
  budgetedAmount="BA", 
  spentAmount="SA", 
  gains="G", 
  monthYear="Month/Year", 
  progress=0, 
  handleDeleteBudget
}) => {
    const red = Math.round((progress / 100) * 255);
    const green = Math.round((1 - progress / 100) * 255);
    const color = `rgb(${red}, ${green}, 0)`
    
    return (
    <div className='flex flex-row items-center'>
      <div className='w-180 h-35 my-3 mr-5 p-1 rounded-3xl '>
        <div className='w-full h-full p-1 rounded-3xl' style={{backgroundColor: color}}>
            <div className='flex bg-gray-700 w-full h-full rounded-3xl p-5'>
                <div className='flex flex-row justify-left items-center'>
                    <div className='w-60'>
                        <div className='text-xl'>{name}</div>
                        <div className='text-lg'>{category}</div>
                    </div>
                    <div className='flex flex-col justify-center items-center w-40'>
                        <div className='text-lg'>{monthYear}</div>
                        {/* <div className='text-lg'>{gains}</div> */}
                    </div>
                    <div className='flex w-20 justify-center text-lg'>{progress}%</div>
                    <div className='flex w-30 justify-center text-2xl'>${spentAmount}/{budgetedAmount}</div>
                </div>
            </div>
        </div>
      </div>
      {/* <div className='flex items-center justify-center bg-gray-500 rounded-full w-15 min-w-15 h-15 mr-5'><MdEdit size={40} /></div> */}
      <div onClick={() => handleDeleteBudget(budget.id)} className='flex items-center justify-center bg-gray-500 rounded-full w-15 min-w-15 h-15 mr-5'><FaTrash size={30} /></div>
    </div>
  )
}

export default BudgetWidget
