import React from 'react';

const CardService = ({ icon, title, body }) => {
    return (
        <div className='card bg-[#F3F7F5] shadow-lg rounded-lg p-4 space-y-3'>
            <div className='font-sm md:font-lg lg:font-lg card-title flex space-x-3'>
                <img className='w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10' src={icon} alt="icon" />
                <h2 className='text-[#5C5959] font-bold text-sm md:text-lg lg:text-lg'> {title}</h2>
            </div>
            <div className='card-body'></div>
            <p className='text-xs md:text-sm lg:text-base'>{body}</p>
        </div>
    );
};

export default CardService;