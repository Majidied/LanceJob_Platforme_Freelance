import React, { useState } from 'react';
import { Filter, User, Star, DollarSign, TrendingUp, ChevronDown, Award, Zap } from "lucide-react";
import { VscVerifiedFilled } from "react-icons/vsc";

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

const SearchTalent = ({ talents = [] }) => {
  console.log("=== SearchTalent Component Debug ===");
  console.log("📦 Received talents prop:", talents);
  console.log("📊 talents type:", typeof talents);
  console.log("🔢 talents is array:", Array.isArray(talents));
  console.log("📏 talents length:", Array.isArray(talents) ? talents.length : 'N/A');

  // SAFETY: Ensure talents is always an array and log first item for structure verification
  const safeTalents = React.useMemo(() => {
    if (Array.isArray(talents)) {
      console.log("✅ talents is array with", talents.length, "items");
      if (talents.length > 0) {
        console.log("📝 First talent structure:", talents[0]);
        console.log("📝 First talent keys:", Object.keys(talents[0]));
      }
      return talents;
    }
    
    console.warn("⚠️ talents is not an array, using empty array");
    return [];
  }, [talents]);

  const [filters, setFilters] = useState({
    experience: "",
    hourlyRate: "",
    earned: ""
  });

  // Helper function to extract string from array field (your backend uses arrays for single values)
  const getArrayValue = (field) => {
    if (Array.isArray(field) && field.length > 0) {
      return field[0]; // Get first element from array
    }
    return field || '';
  };

  // Helper function to format experience
  const formatExperience = (exp) => {
    const expStr = getArrayValue(exp);
    if (!expStr) return 'Not specified';
    return expStr.charAt(0).toUpperCase() + expStr.slice(1);
  };

  // Helper function to format status
  const formatStatus = (status) => {
    if (!status) return 'Unverified';
    switch (status.toUpperCase()) {
      case 'VERIFIED': return 'Verified';
      case 'NOT_VERIFIED': return 'Unverified';
      default: return status;
    }
  };

  // Helper function to extract numeric value from rate/earned strings
  const extractNumericValue = (value) => {
    if (!value) return 0;
    const str = typeof value === 'string' ? value : String(value);
    const numbers = str.match(/[\d.]+/);
    return numbers ? parseFloat(numbers[0]) : 0;
  };

  // Apply filters (backend handles search)
  const filteredTalents = React.useMemo(() => {
    console.log("🔍 Filtering", safeTalents.length, "talents...");
    console.log("🔍 Active filters:", filters);
    
    const filtered = safeTalents.filter(talent => {
      if (!talent || typeof talent !== 'object') {
        console.log("❌ Invalid talent:", talent);
        return false;
      }
      
      // Filter by experience level
      const talentExp = getArrayValue(talent.experience) || getArrayValue(talent.level);
      const matchesExperience = filters.experience ? talentExp === filters.experience : true;
      
      // Filter by hourly rate
      const talentRate = extractNumericValue(getArrayValue(talent.rate));
      const filterRate = extractNumericValue(filters.hourlyRate);
      const matchesRate = filters.hourlyRate ? talentRate >= filterRate : true;
      
      // Filter by earned amount
      const talentEarned = extractNumericValue(getArrayValue(talent.earned));
      const filterEarned = extractNumericValue(filters.earned);
      const matchesEarned = filters.earned ? talentEarned >= filterEarned : true;
      
      const matches = matchesExperience && matchesRate && matchesEarned;
      
      return matches;
    });
    
    console.log("🎯 Filtered result:", filtered.length, "talents");
    return filtered;
  }, [safeTalents, filters]);

  // Extract unique filter options from your backend data
  const experiences = React.useMemo(() => {
    const exps = [...new Set(safeTalents.map(t => 
      getArrayValue(t?.experience) || getArrayValue(t?.level)
    ).filter(Boolean))];
    console.log("📊 Available experiences:", exps);
    return exps;
  }, [safeTalents]);

  const hourlyRates = React.useMemo(() => {
    const rates = [...new Set(safeTalents.map(t => getArrayValue(t?.rate)).filter(Boolean))];
    console.log("📊 Available rates:", rates);
    return rates.sort((a, b) => extractNumericValue(a) - extractNumericValue(b));
  }, [safeTalents]);

  const earnedAmounts = React.useMemo(() => {
    const earned = [...new Set(safeTalents.map(t => getArrayValue(t?.earned)).filter(Boolean))];
    console.log("📊 Available earned amounts:", earned);
    return earned.sort((a, b) => extractNumericValue(a) - extractNumericValue(b));
  }, [safeTalents]);

  return (
    <div className="flex-1 w-full max-w-screen-xl px-6 mx-auto flex gap-8 h-[calc(100vh-200px)] overflow-hidden">
      {/* Filters Sidebar */}
      <div className="w-80 bg-white dark:bg-navy-800 rounded-2xl shadow-lg border border-gray-200 dark:border-navy-700 p-6 h-full overflow-y-auto flex-shrink-0">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-navy-600">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
            <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h4>
        </div>

        <FilterOption
          label="Experience Level"
          icon={Star}
          options={experiences}
          value={filters.experience}
          onChange={v => setFilters(f => ({ ...f, experience: v }))}
          placeholder="Select experience level"
        />

        <FilterOption
          label="Hourly Rate"
          icon={DollarSign}
          options={hourlyRates}
          value={filters.hourlyRate}
          onChange={v => setFilters(f => ({ ...f, hourlyRate: v }))}
          placeholder="Select minimum rate"
        />

        <FilterOption
          label="Total Earned"
          icon={TrendingUp}
          options={earnedAmounts}
          value={filters.earned}
          onChange={v => setFilters(f => ({ ...f, earned: v }))}
          placeholder="Select minimum earned"
        />

        <button
          onClick={() => setFilters({ experience: "", hourlyRate: "", earned: "" })}
          className="w-full mt-4 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200"
        >
          Clear All Filters
        </button>
      </div>

      {/* Talent Listings */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-4 pr-2">
          {filteredTalents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-navy-800 dark:to-navy-900 rounded-2xl border border-gray-200 dark:border-navy-700">
              <div className="p-4 bg-white dark:bg-navy-800 rounded-full shadow-lg mb-4">
                <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No talents found
              </h3>
            </div>
          ) : (
            filteredTalents.map((talent, index) => (
              <div
                key={talent._id || `talent-${index}`}
                className="group relative bg-white dark:bg-navy-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-navy-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient background overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/0 to-emerald-100/0 dark:from-emerald-900/0 dark:via-emerald-900/0 dark:to-emerald-800/0 group-hover:from-emerald-50/30 group-hover:via-emerald-50/10 group-hover:to-emerald-100/30 dark:group-hover:from-emerald-900/20 dark:group-hover:via-emerald-900/5 dark:group-hover:to-emerald-800/20 transition-all duration-500"></div>
                
                <div className="relative p-4">
                  {/* Header Section */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="relative w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        {/* Status indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-navy-800 flex items-center justify-center ${
                          talent.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}>
                          {talent.status === 'VERIFIED' && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Name and Title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                            {talent.name || 'Anonymous User'}
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-300 font-medium mb-2 line-clamp-1">
                            {getArrayValue(talent.title) || getArrayValue(talent.bio) || 'Professional Freelancer'}
                          </p>
                        </div>
                        
                        
                        
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {/* Verification Status */}
                    <div className="bg-gray-50 dark:bg-navy-700/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <VscVerifiedFilled className={`w-3 h-3 ${
                          talent.status === 'VERIFIED' ? 'text-emerald-500' : 'text-gray-400'
                        }`}/>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {formatStatus(talent.status)}
                      </p>
                    </div>

                    {/* Experience Level */}
                    <div className="bg-gray-50 dark:bg-navy-700/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {formatExperience(talent.experience) || getArrayValue(talent.level) || 'Entry'} Level
                      </p>
                    </div>

                    {/* Total Earned */}
                    <div className="bg-gray-50 dark:bg-navy-700/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {getArrayValue(talent.earned) || '$0'} Earned
                      </p>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-gray-50 dark:bg-navy-700/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Award className="w-3 h-3 text-purple-500" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {getArrayValue(talent.success) || '95%'} Success
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 text-sm">
                      {getArrayValue(talent.description) || getArrayValue(talent.bio) || 'Experienced professional ready to bring your projects to life with dedication and expertise.'}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {talent.skills && Array.isArray(talent.skills) && talent.skills.length > 0 ? (
                        talent.skills.slice(0, 5).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-md hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md">
                          <Zap className="w-3 h-3 mr-1" />
                          Skills to be updated
                        </span>
                      )}
                      {talent.skills && talent.skills.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-md font-medium">
                          +{talent.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-navy-700">
                    <button className="w-25 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors duration-200">
                      Hire
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchTalent;