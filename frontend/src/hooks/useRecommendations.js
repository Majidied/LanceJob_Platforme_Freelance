import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import useUser from './useUser';
import recommendationService from '../api/recommendation';

export const useRecommendations = (options = {}) => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const [lastFetchTime, setLastFetchTime] = useState(null);

    // Memoized default options for better performance
    const defaultOptions = useMemo(() => ({
        userID: user.id,
        limit: 20,
        includeApplied: false,
        ...options
    }), [options, user]);

    // Recommendations query with improved error handling
    const {
        data: recommendationsResponse,
        isLoading: isRecommendationsLoading,
        isError: isRecommendationsError,
        error: recommendationsError,
        refetch: refetchRecommendations,
        isFetching: isRefetching
    } = useQuery({
        queryKey: ['recommendations', user?.id, defaultOptions],
        queryFn: async () => {
            setLastFetchTime(new Date().toISOString());
            return recommendationService.getRecommendations(defaultOptions);
        },
        enabled: !!user?.id, // Only fetch if user is available
        retry: (failureCount, error) => {
            // Smart retry logic based on error type
            if (error?.response?.status === 401) return false; // Don't retry auth errors
            if (error?.response?.status >= 500) return failureCount < 3; // Retry server errors
            return failureCount < 2; // Limited retries for other errors
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
        staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
        onError: (err) => {
            console.error('Error fetching recommendations:', err);
        },
        select: (response) => {
            // Extract and enrich the recommendations from the response
            const recommendations = response?.recommendations || [];
            console.log(response)
            return {
                recommendations: recommendations.map(rec => ({
                    ...rec,
                    // Ensure we have fallback values
                    recommendationScore: rec.recommendationScore || 0,
                    reasons: rec.reasons || [],
                    fetchedAt: lastFetchTime
                })),
                totalCount: response?.data?.totalCount || 0,
                hasMore: response?.data?.hasMore || false,
                metadata: {
                    ...response?.data?.metadata,
                    fetchedAt: lastFetchTime,
                    algorithm: response?.data?.metadata?.algorithm || 'hybrid'
                }
            };
        },
    });

    // Track interaction mutation
    const trackInteractionMutation = useMutation({
        mutationFn: ({ missionId, interactionType, metadata }) => 
            recommendationService.trackInteraction(missionId, interactionType, metadata),
        onError: (error) => {
            console.error('Error tracking interaction:', error);
            // Don't throw error for tracking failures
        },
    });

    // Enhanced tracking methods with debouncing and batch optimization
    const trackMissionView = useCallback((missionId, metadata = {}) => {
        trackInteractionMutation.mutate({
            missionId,
            interactionType: 'view',
            metadata: {
                ...metadata,
                source: 'home_page',
                tab: 'best_matches',
                timestamp: new Date().toISOString(),
                algorithm: recommendationsResponse?.metadata?.algorithm
            }
        });
    }, [trackInteractionMutation, recommendationsResponse?.metadata?.algorithm]);

    const trackMissionClick = useCallback((missionId, metadata = {}) => {
        trackInteractionMutation.mutate({
            missionId,
            interactionType: 'click',
            metadata: {
                ...metadata,
                source: 'home_page',
                tab: 'best_matches',
                timestamp: new Date().toISOString(),
                algorithm: recommendationsResponse?.metadata?.algorithm
            }
        });
    }, [trackInteractionMutation, recommendationsResponse?.metadata?.algorithm]);

    const trackMissionApplication = useCallback((missionId, metadata = {}) => {
        trackInteractionMutation.mutate({
            missionId,
            interactionType: 'apply',
            metadata: {
                ...metadata,
                source: 'home_page',
                tab: 'best_matches',
                timestamp: new Date().toISOString(),
                algorithm: recommendationsResponse?.metadata?.algorithm
            }
        });
    }, [trackInteractionMutation, recommendationsResponse?.metadata?.algorithm]);

    const trackMissionSave = useCallback((missionId, metadata = {}) => {
        trackInteractionMutation.mutate({
            missionId,
            interactionType: 'save',
            metadata: {
                ...metadata,
                source: 'home_page',
                tab: 'best_matches',
                timestamp: new Date().toISOString(),
                algorithm: recommendationsResponse?.metadata?.algorithm
            }
        });
    }, [trackInteractionMutation, recommendationsResponse?.metadata?.algorithm]);

    // Batch track multiple views (when loading the page)
    const trackBatchViews = (missionIds, metadata = {}) => {
        const interactions = missionIds.map(missionId => ({
            missionId,
            interactionType: 'view',
            metadata: {
                ...metadata,
                source: 'home_page',
                tab: 'best_matches',
                batch: true
            }
        }));

        // Use the service's batch tracking method
        recommendationService.batchTrackInteractions(interactions)
            .catch(error => {
                console.error('Error batch tracking views:', error);
            });
    };

    // Enhanced refresh with analytics
    const refreshRecommendations = useCallback(async () => {
        try {
            const result = await refetchRecommendations();
            if (result.data) {
                // Track successful refresh
                trackInteractionMutation.mutate({
                    missionId: 'system',
                    interactionType: 'refresh',
                    metadata: {
                        source: 'home_page',
                        tab: 'best_matches',
                        timestamp: new Date().toISOString(),
                        success: true
                    }
                });
            }
            return result;
        } catch (error) {
            console.error('Failed to refresh recommendations:', error);
            throw error;
        }
    }, [refetchRecommendations, trackInteractionMutation]);

    // Update recommendation options and refetch with better UX
    const updateRecommendationOptions = useCallback(async (newOptions) => {
        const updatedOptions = { ...defaultOptions, ...newOptions };
        queryClient.setQueryData(['recommendations', user?.id, updatedOptions], undefined);
        
        return queryClient.fetchQuery({
            queryKey: ['recommendations', user?.id, updatedOptions],
            queryFn: () => recommendationService.getRecommendations(updatedOptions),
        });
    }, [defaultOptions, queryClient, user?.id]);

    // Analytics and insights
    const getRecommendationInsights = useCallback(() => {
        const recommendations = recommendationsResponse?.recommendations || [];
        const totalRecommendations = recommendations.length;
        
        if (totalRecommendations === 0) return null;

        const averageScore = recommendations.reduce((sum, rec) => sum + (rec.recommendationScore || 0), 0) / totalRecommendations;
        const topReasons = recommendations
            .flatMap(rec => rec.reasons || [])
            .reduce((acc, reason) => {
                acc[reason] = (acc[reason] || 0) + 1;
                return acc;
            }, {});

        return {
            totalRecommendations,
            averageScore: Math.round(averageScore * 100),
            topReasons: Object.entries(topReasons)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([reason, count]) => ({ reason, count })),
            algorithm: recommendationsResponse?.metadata?.algorithm,
            lastFetched: lastFetchTime
        };
    }, [recommendationsResponse, lastFetchTime]);

    return {
        // Enhanced data with computed properties
        recommendations: recommendationsResponse?.recommendations || [],
        totalCount: recommendationsResponse?.totalCount || 0,
        hasMore: recommendationsResponse?.hasMore || false,
        metadata: recommendationsResponse?.metadata || {},
        insights: getRecommendationInsights(),
        
        // Enhanced loading states
        isLoading: isRecommendationsLoading,
        isRefetching,
        isError: isRecommendationsError,
        error: recommendationsError,
        
        // Enhanced actions
        refetch: refreshRecommendations,
        updateOptions: updateRecommendationOptions,
        
        // Enhanced tracking methods
        trackMissionView,
        trackMissionClick,
        trackMissionApplication,
        trackMissionSave,
        trackBatchViews,
        
        // Tracking state
        isTracking: trackInteractionMutation.isLoading,
        
        // Utils and status
        isEnabled: !!user?.id,
        hasRecommendations: (recommendationsResponse?.recommendations?.length || 0) > 0,
        lastFetchTime,
    };
};

export default useRecommendations;
