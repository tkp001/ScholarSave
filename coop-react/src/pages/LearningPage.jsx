import React from 'react'

//add click and hover effects
const LearningPage = () => {
  return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col items-center w-250 h-400 p-10">
          <div className='text-5xl'>Learn About Finance</div>
          <input
                      className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5"
                      type="text"
                      name="search"
                      // value={}
                      placeholder="Ask a Question"
                      // onChange={}
                    />
          <div className='text-3xl mb-5'>Suggested Topics</div>
          <div className='flex flex-col bg-gray-700  w-170 h-100 max-h-100 rounded-3xl mb-5 p-5'>
            <div className='text-3xl mb-2'>Title</div>
            <div className='flex flew-grow overflow-auto text-xl'>Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description </div>
            <div className=''></div>
          </div>
        </div>
      </div>
  )
}

export default LearningPage