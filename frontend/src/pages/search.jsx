import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import SearchJob from '../components/landing/job';
import SearchTalent from '../components/landing/freelancer';
import useSearch from '../hooks/usesearch';
import Navbar from '../components/landing/navbar';
const GuestSearch = () => {
    const location = useLocation();

    const [selected, setSelected] = useState('Jobs');
    const [isOpen, setIsOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Read query parameters from URL on initial load
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') || '';
        const type = params.get('type') || 'jobs';

        if (q.trim()) {
            setSearchInput(q);
            setSearchQuery(q);
            setSelected(type === 'freelancers' || type === 'talent' ? 'Talents' : 'Jobs');
        }
    }, [location.search]);

    const searchType = selected === 'Jobs' ? 'jobs' : 'freelancers';
    const { freelancers, jobs, isLoading, isLoadingJobs } = useSearch(searchQuery, searchType);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (value) => {
        setSelected(value);
        setIsOpen(false);

        const query = searchInput.trim();
        if (query) {
            setSearchQuery(query);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.trim();
            if (query) {
                setSearchQuery(query);
            }
        }
    };

    const getPlaceholderText = () => {
        return selected === 'Jobs'
            ? "Search for jobs"
            : "Search for talents, skills, or expertise...";
    };

    return (
        <div>
            <Navbar hideLinks={['about', 'services']} />
            <div className="mt-20 flex flex-col h-screen bg-gray-50 dark:bg-navy-900">
                {/* Header */}
                <div className="w-full max-w-screen-xl p-6 mx-auto flex-shrink-0">
                    <div className="flex items-center gap-6">

                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <div className="ml-88 relative flex items-center h-14 rounded-2xl bg-white dark:bg-navy-800 shadow-lg border border-gray-200 dark:border-navy-700">
                                <div className="pl-5 pr-3">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={getPlaceholderText()}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 h-full bg-transparent text-gray-700 dark:text-white placeholder-gray-400 outline-none text-sm font-medium"
                                />
                                <div className="relative mr-2">
                                    <div
                                        onClick={toggleDropdown}
                                        className="dropdown-toggle flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200"
                                    >
                                        <span className="text-sm font-medium">{selected}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isOpen && (
                                        <div className="dropdown-menu absolute right-0 z-10 w-48 mt-2 bg-white dark:bg-navy-700 shadow-xl rounded-xl border border-gray-200 dark:border-navy-600 overflow-hidden">
                                            <div
                                                onClick={() => handleSelect('Talents')}
                                                className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-emerald-50 dark:hover:bg-navy-600 transition-colors duration-150"
                                            >
                                                Talents
                                            </div>
                                            <div
                                                onClick={() => handleSelect('Jobs')}
                                                className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-emerald-50 dark:hover:bg-navy-600 transition-colors duration-150 border-t border-gray-100 dark:border-navy-600"
                                            >
                                                Jobs
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {(isLoading || isLoadingJobs) && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                            Searching {selected.toLowerCase()}...
                        </span>
                    </div>
                )}

                {/* Results */}
                {!isLoading && !isLoadingJobs && (
                    selected === 'Jobs' ? (
                        <SearchJob jobs={Array.isArray(jobs) ? jobs : []} search={searchQuery} />
                    ) : (
                        <SearchTalent talents={Array.isArray(freelancers) ? freelancers : []} search={searchQuery} />
                    )
                )}
            </div>
        </div>
    );
    
};

export default GuestSearch;
