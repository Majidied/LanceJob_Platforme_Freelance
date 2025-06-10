import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅
import freelancepic from '../../assets/freelancepic.png';

const Home = () => {
    const [clicked, setClicked] = useState(false);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate(); // ✅

    const suggestions = ['web design', 'development', 'UI', 'UX'];

    const handleSuggestionClick = (text) => {
        setSearchText(text);
    };

    const handleSearch = () => {
        if (searchText.trim() === '') return;
        const type = clicked ? 'job' : 'talent';
        navigate(`/search?q=${encodeURIComponent(searchText)}&type=${type}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="w-full bg-white dark:bg-navy-900 py-12 md:py-20 mt-20">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-10">

                {/* Left */}
                <div className="w-full md:w-1/2 space-y-6">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400">BUILD YOUR CAREER</h3>
                        <div className="w-10 h-0.5 bg-[#5A8C8E] rounded-full"></div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
                        Where <span className="text-[#55A5CF]">Talent</span> Meets <span className="text-[#55A5CF]">Opportunity</span>
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                        Join thousands of freelancers and businesses creating successful partnerships every day.
                    </p>

                    {/* Search bar */}
                    <div className="relative mt-4">
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyDown} // ✅
                            placeholder="Find job or talent..."
                            className="w-full py-3 pl-5 pr-36 rounded-full border border-gray-600 dark:border-gray-700 shadow-sm focus:ring-1 focus:ring-[#010101] focus:outline-none transition"
                        />
                        <button
                            onClick={() => {
                                setClicked(!clicked);
                            }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 min-w-[100px] transition ${clicked ? 'bg-gray-600 text-white' : 'bg-[#2c5153] text-white'}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                />
                            </svg>
                            {clicked ? 'Job' : 'Talent'}
                        </button>
                    </div>

                    {/* Suggestions */}
                    <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Popular searches:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((text) => (
                                <button
                                    key={text}
                                    onClick={() => handleSuggestionClick(text)}
                                    className="bg-[#f3f4f6] dark:bg-gray-700 hover:bg-[#e0e0e0] dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full transition"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <img
                        src={freelancepic}
                        alt="Freelancers working"
                        className="w-[90%] max-w-md object-contain rounded-2xl "
                    />
                </div>
            </div>

            {/* Bottom Explore More */}
            <div className="mt-16 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                    Start your journey—scroll to explore more
                </p>
                <a href="#carousel" className="group flex flex-col items-center mt-1 cursor-pointer">
                    <span className="animate-bounce">
                        <svg
                            className="w-6 h-6 text-[#55A5CF] group-hover:text-[#3b8cb7] transition"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                    <span className="text-xs mt-1 text-[#55A5CF] group-hover:text-[#3b8cb7] font-semibold uppercase tracking-wide">
                        Scroll Down
                    </span>
                </a>
            </div>
        </section>
    );
};

export default Home;
