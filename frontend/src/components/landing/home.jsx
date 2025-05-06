import React from 'react';
import freelancepic from '../../assets/freelancepic.png';
import { useState } from 'react';

const Home = () => {
    const [clicked, setClicked] = useState(false);
    return (
        <section id='home' className="flex flex-col md:flex-row justify-between px-8 sm:px-8 md:px-12 lg:px-15 py-16 md:py-16 mt-10 md:mt-20 z-50">
            {/* Left Content */}
            <div className="w-full md:max-w-xl">
                {/* Build your career heading with line */}
                <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-sm font-semibold tracking-wider whitespace-nowrap">
                        BUILD YOUR CAREER
                    </h3>
                    <div className="flex-grow h-0.5 bg-[#5A8C8E] max-w-[60px]"></div>
                </div>

                {/* Main heading and description */}
                <div className=" md:space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-semibold">
                        Where <span className="text-[#55A5CF]">Talent</span> Meets
                        <span className="text-[#55A5CF]"> Opportunity</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600">
                        Join thousands of freelancers and businesses creating successful partnerships every day.
                    </p>
                </div>

                {/* Search bar */}
                <div className="mt-6 relative">
                    <input
                        type="text"
                        placeholder="find job/talent"
                        className="px-4 py-3 w-full border rounded-full text-sm md:text-base"
                    />
                    <button
                        onClick={() => setClicked(!clicked)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm flex items-center ${clicked ? "bg-gray-500 text-white" : "bg-black text-white"
                            }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-4 mr-2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                            />
                        </svg>
                        {clicked ? "Job" : "Talent"}
                    </button>
                </div>

                {/* Popular searches section */}
                <div>
                    <p className='text-[#97929E] mt-3 ml-3 md:ml-6 text-sm'>Popular searches</p>
                </div>
                <div className="mt-2 md:mt-4 text-xs md:text-sm flex flex-wrap gap-2 ml-3 md:ml-6 text-[#97929E]">
                    <span className="bg-[#EFEEF0] px-2 py-1 rounded-xl">web design</span>
                    <span className="bg-[#EFEEF0] px-2 py-1 rounded-xl">development</span>
                    <span className="bg-[#EFEEF0] px-2 py-1 rounded-xl">UI</span>
                    <span className="bg-[#EFEEF0] px-2 py-1 rounded-xl">UX</span>
                </div>
            </div>

            {/* Right Image - Hidden on small screens */}
            <div className="hidden md:block mt-10 md:mt-0">
                <img src={freelancepic} alt="Freelancers working" className="w-full max-w-md" />
            </div>
        </section>
    );
};

export default Home;