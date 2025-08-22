import React from 'react'


//props are read-only, they are immutable
const Seacrh = ({searchTerm, setSearchTerm}) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />
        <input   
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={((event) => setSearchTerm(event.target.value))} 
          //Set the searchTerm state to the value of the input field.
        />
      </div>
    </div>
  )
}

export default Seacrh
