import React from 'react'
import '../App.css';
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const SavingWidget = ({
    saving,
    name = "Saving Name",
    description = "Description",
    goalAmount = 0,
    savedAmount = 0,
    startDate = "Start Date",
    endDate = "End Date",
    handleDeleteSaving,
    monthYear,
  }) => {
    let progress;
    progress = Math.round((savedAmount / goalAmount) * 100);
    if (progress > 100) {
        progress = 100;
    }
    if (progress < 0) {
        progress = 0;
    }
    const red = Math.round((progress / 100) * 255);
    const green = Math.round((1 - progress / 100) * 255);
    const color = `rgb(${red}, ${green}, 0)`
    const roundedProgress = Math.round(progress);

    return (
    <div>
        <div className='flex flex-row items-center'>
            <div className='flex flex-col items-center justify-center bg-gray-600 w-175 h-35 my-3 mr-5 p-1 rounded-3xl '>
                <div className='flex flex-row items-center w-full h-15 p-5'>
                    <div className='text-2xl w-130 mt-4'>
                        {name}
                        <div className='text-sm'>Goal: {startDate} to {endDate}</div>
                        <div className='text-sm mt-1'>{monthYear}</div>
                    </div>
                    <div className='text-xl w-85'>${savedAmount}/{goalAmount}</div>
                    <div className='text-xl w-15'>{roundedProgress}%</div>
                </div>
                <div className='w-full h-15 m-5 px-5'>
                    <div className='w-full h-full bg-gray-500 rounded-2xl'>
                        <div className='h-full bg-green-600 rounded-2xl' style={{ width: `${roundedProgress}%`}}></div>
                    </div>
                </div>
            </div>
            
            {/* <div className='flex items-center justify-center bg-gray-500 rounded-full w-15 h-15 mr-5'><MdEdit size={40} /></div> */}
            <div onClick={() => handleDeleteSaving(saving.id)} className='flex items-center justify-center bg-gray-500 rounded-full w-15 min-w-15 h-15 mr-5 scale-on-hover'><FaTrash size={30} /></div>
        </div>
    </div>
  )
}

export default SavingWidget
 