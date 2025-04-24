import React from 'react'

const ToolsPage = () => {
  return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col items-center w-full h-400 p-10">
          <div className='text-5xl mb-5'>Financial Tools</div>
          
          <div className='flex flex-col bg-gray-700 w-200 max-h-100 rounded-3xl mb-5'>
            <div className='flex flex-row items-center h-12'>
              <div className='text-xl ml-4 w-185'>Title</div>
              <div className='text-4xl mb-2'>+</div> 
            </div>
            <div className='w-full h-100 rounded-b-3xl bg-red-500 p-5'>Test Contents</div>
          </div>
        </div>
      </div>
  )
}

export default ToolsPage