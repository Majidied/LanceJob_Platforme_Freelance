import { useQuery } from '@tanstack/react-query';
import { searchFreelancers, searchJobs } from '../api/searchApi';

const useSearch = (searchText, searchType = 'both') => {
  const trimmedSearch = searchText?.trim() || '';
  const shouldSearchFreelancers = Boolean(trimmedSearch) && (searchType === 'freelancers' || searchType === 'both');
  const shouldSearchJobs = Boolean(trimmedSearch) && (searchType === 'jobs' || searchType === 'both');

  console.log(`🔍 useSearch: "${searchText}" (type: ${searchType})`);
  console.log(`Should search - freelancers: ${shouldSearchFreelancers}, jobs: ${shouldSearchJobs}`);

  const {
    data: freelancers = [], // API already returns clean array
    isLoading: isLoadingFreelancers,
    isError: isErrorFreelancers,
    error: errorFreelancers,
  } = useQuery({
    queryKey: ['searchFreelancers', trimmedSearch, searchType],
    queryFn: () => searchFreelancers(trimmedSearch),
    enabled: shouldSearchFreelancers,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 300000,
  });

  const {
    data: jobs = [], // API already returns clean array
    isLoading: isLoadingJobs,
    isError: isErrorJobs,
    error: errorJobs,
  } = useQuery({
    queryKey: ['searchJobs', trimmedSearch, searchType],
    queryFn: () => searchJobs(trimmedSearch),
    enabled: shouldSearchJobs,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 300000,
  });

  // Ensure arrays (safety check)
  const safeFreelancers = Array.isArray(freelancers) ? freelancers : [];
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  console.log(`📊 useSearch returning: ${safeFreelancers.length} freelancers, ${safeJobs.length} jobs`);

  return {
    freelancers: safeFreelancers,
    jobs: safeJobs,
    isLoading: isLoadingFreelancers,
    isError: isErrorFreelancers,
    error: errorFreelancers,
    isLoadingJobs,
    isErrorJobs,
    errorJobs,
  };
};

export default useSearch;