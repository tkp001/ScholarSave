import React from 'react'


const HomePage = () => {
  const apiUrl = import.meta.REACT_APP_API_URL;
  console.log("hi")

  return (
    <>
    
      <div>HomePage</div>
      <h1>{apiUrl}</h1>

    </>
  )
}

export default HomePage