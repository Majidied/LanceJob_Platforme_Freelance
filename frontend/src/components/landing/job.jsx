import React, { useState } from 'react';
import { Filter, DollarSign, Clock, Star, ChevronDown } from "lucide-react";

const FilterOption = ({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [isOptionOpen, setIsOptionOpen] = useState(false);

  return (
    <div className="relative mb-6">
      <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <Icon className="w-4 h-4 text-emerald-500" />
        {label}
      </label>
      <div className="relative">
        <div 
          onClick={() => setIsOptionOpen(!isOptionOpen)}
          className="w-full px-4 py-3 bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-400 transition-all duration-200 flex items-center justify-between group"
        >
          <span className={`${value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} text-sm`}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-all duration-200 ${isOptionOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isOptionOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl shadow-xl overflow-hidden">
            <div 
              onClick={() => {
                onChange('');
                setIsOptionOpen(false);
              }}
              className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-navy-600 cursor-pointer transition-colors duration-150"
            >
              All {label}
            </div>
            {options.map(option => (
              <div 
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOptionOpen(false);
                }}
                className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-navy-600 cursor-pointer transition-colors duration-150 border-t border-gray-100 dark:border-navy-600"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SearchJob = ({ jobs = [], search }) => {
  // SAFETY FIRST: Ensure jobs is always an array
  const safeJobs = React.useMemo(() => {
    console.log("SearchJob received jobs:", jobs);
    console.log("SearchJob jobs type:", typeof jobs);
    console.log("SearchJob jobs is array:", Array.isArray(jobs));
    
    if (Array.isArray(jobs)) {
      return jobs;
    }
    
    // Try to extract array from common response structures
    if (jobs && typeof jobs === 'object') {
      if (Array.isArray(jobs.data)) return jobs.data;
      if (Array.isArray(jobs.results)) return jobs.results;
      if (Array.isArray(jobs.items)) return jobs.items;
    }
    
    console.warn("SearchJob: jobs is not an array, using empty array");
    return [];
  }, [jobs]);

  const [filters, setFilters] = useState({
    type: "",
    experience: "",
    budgetRange: ""
  });

  // State to track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  // Helper function to get budget range
  const getBudgetRange = (budget) => {
    if (!budget || typeof budget !== 'number') return "Not specified";
    if (budget < 1000) return "Under $1,000";
    if (budget <= 5000) return "$1,000 - $5,000";
    if (budget <= 10000) return "$5,000 - $10,000";
    return "Above $10,000";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to calculate time posted
  const getTimePosted = (createdAt) => {
    if (!createdAt) return "Recently posted";
    try {
      const now = new Date();
      const created = new Date(createdAt);
      const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
      
      if (diffHours < 1) return "Just posted";
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} days ago`;
      return formatDate(createdAt);
    } catch (error) {
      return "Recently posted";
    }
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to check if text needs truncation
  const needsTruncation = (text, maxLength = 200) => {
    return text && text.length > maxLength;
  };

  // Function to toggle description expansion
  const toggleDescription = (jobId) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Apply filters to the search results using actual backend data structure
  const filteredJobs = React.useMemo(() => {
    try {
      return safeJobs.filter(job => {
        if (!job || typeof job !== 'object') return false;
        
        // Search filter - check if job matches search query
        const matchesSearch = !search || search.trim() === '' || (
          (job.title && job.title.toLowerCase().includes(search.toLowerCase())) ||
          (job.description && job.description.toLowerCase().includes(search.toLowerCase())) ||
          (job.tags && Array.isArray(job.tags) && job.tags.some(tag => 
            tag && tag.toLowerCase().includes(search.toLowerCase())
          ))
        );
        
        // Filter by type (using actual backend field)
        const matchesType = filters.type ? job.type === filters.type : true;
        
        // Filter by experience (using actual backend field)
        const matchesExperience = filters.experience ? job.experience === filters.experience : true;
        
        // Filter by budget range
        const jobBudgetRange = getBudgetRange(job.budget);
        const matchesBudgetRange = filters.budgetRange ? jobBudgetRange === filters.budgetRange : true;
        
        return matchesSearch && matchesType && matchesExperience && matchesBudgetRange;
      });
    } catch (error) {
      console.error("Error filtering jobs:", error);
      return [];
    }
  }, [safeJobs, filters, search]);

  // Unique filter options from search results (using actual backend fields)
  const types = React.useMemo(() => {
    try {
      return [...new Set(safeJobs.map(j => j?.type).filter(Boolean))];
    } catch (error) {
      console.error("Error extracting types:", error);
      return [];
    }
  }, [safeJobs]);

  const experiences = React.useMemo(() => {
    try {
      return [...new Set(safeJobs.map(j => j?.experience).filter(Boolean))];
    } catch (error) {
      console.error("Error extracting experiences:", error);
      return [];
    }
  }, [safeJobs]);

  const budgetRanges = ["Under $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "Above $10,000"];

  return (
    <div className="flex-1 w-full max-w-screen-xl px-6 mx-auto flex gap-8 h-[calc(100vh-200px)] overflow-hidden">
      {/* Enhanced Filters Sidebar */}
      <div className="w-80 bg-white dark:bg-navy-800 rounded-2xl shadow-lg border border-gray-200 dark:border-navy-700 p-6 h-full overflow-y-auto flex-shrink-0">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-navy-600">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
            <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            Filters
          </h4>
        </div>

        <FilterOption
          label="Project Type"
          icon={Clock}
          options={types}
          value={filters.type}
          onChange={v => setFilters(f => ({ ...f, type: v }))}
          placeholder="Select project type"
        />

        <FilterOption
          label="Experience Level"
          icon={Star}
          options={experiences}
          value={filters.experience}
          onChange={v => setFilters(f => ({ ...f, experience: v }))}
          placeholder="Select experience level"
        />

        <FilterOption
          label="Budget Range"
          icon={DollarSign}
          options={budgetRanges}
          value={filters.budgetRange}
          onChange={v => setFilters(f => ({ ...f, budgetRange: v }))}
          placeholder="Select budget range"
        />

        {/* Clear Filters Button */}
        <button
          onClick={() =>
            setFilters({ type: "", experience: "", budgetRange: "" })
          }
          className="w-full mt-4 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200"
        >
          Clear All Filters
        </button>
      </div>

      {/* Job Listings Component */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="flex flex-col gap-6 pb-6">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-navy-800 rounded-2xl shadow-lg border border-gray-200 dark:border-navy-700">
              <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                No jobs found
              </div>
          
            </div>
          ) : (
            filteredJobs.map((job, index) => {
              // Additional safety check for each job
              if (!job || typeof job !== 'object') {
                console.warn(`Invalid job at index ${index}:`, job);
                return null;
              }
              
              const jobId = job._id || job.id || `job-${index}`;
              const description = job?.description || 'No description available';
              const isExpanded = expandedDescriptions.has(jobId);
              const showReadMore = needsTruncation(description);
              
              return (
                <div
                  key={jobId}
                  className="p-6 bg-white dark:bg-navy-800 rounded-2xl shadow-lg border border-gray-200 dark:border-navy-700 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors duration-200">
                          {job?.title || 'Untitled Job'}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-navy-700 px-3 py-1 rounded-full">
                          {getTimePosted(job?.createdAt)}
                        </span>
                      </div>

                      {/* Tags/Skills - Using actual backend field 'tags' instead of 'skills' */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job?.tags && Array.isArray(job.tags) && job.tags.length > 0 && job.tags.map((tag, i) => (
                          tag && (
                            <span
                              key={`${jobId}-tag-${i}`}
                              className="px-3 py-1 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800"
                            >
                              {tag}
                            </span>
                          )
                        ))}
                        {(!job?.tags || !Array.isArray(job.tags) || job.tags.length === 0) && (
                          <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full">
                            No tags specified
                          </span>
                        )}
                      </div>

                      {/* Description with Read More/Less functionality */}
                      <div className="mb-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {isExpanded ? description : truncateText(description)}
                        </p>
                        {showReadMore && (
                          <button
                            onClick={() => toggleDescription(jobId)}
                            className="mt-2 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors duration-200 focus:outline-none"
                          >
                            {isExpanded ? 'Read less ↑' : 'Read more →'}
                          </button>
                        )}
                      </div>

                      {/* Job Details - Using actual backend data structure */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-navy-900 dark:to-emerald-900/10 border border-gray-200 dark:border-navy-600">
                        <div className="flex gap-8">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Budget
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {job?.budget && typeof job.budget === 'number' 
                                ? `$${job.budget.toLocaleString()}` 
                                : 'Not specified'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Type
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white capitalize">
                              {job?.type || 'Not specified'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Deadline
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(job?.deadline)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Experience
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white capitalize">
                              {job?.experience || 'Not specified'}
                            </div>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean) // Remove any null entries
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchJob;