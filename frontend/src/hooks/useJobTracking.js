import { useMutation } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import useUser from './useUser';
import recommendationService from '../api/recommendation';

/**
 * Universal job tracking hook
 * Tracks all job interactions regardless of source (recommendations, regular jobs, etc.)
 */
export const useJobTracking = () => {
    const { user } = useUser();
    const [sessionStartTime] = useState(Date.now());
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());

    // Track interaction mutation
    const trackInteractionMutation = useMutation({
        mutationFn: ({ jobId, interactionType, metadata }) => 
            recommendationService.trackInteraction(jobId, interactionType, metadata),
        onError: (error) => {
            console.error('Error tracking interaction:', error);
            // Don't throw error for tracking failures
        },
    });

    // Enhanced tracking methods with comprehensive metadata
    const getSessionMetadata = useCallback(() => {
        const now = Date.now();
        const sessionDuration = now - sessionStartTime;
        const timeSinceLastActivity = now - lastActivityTime;
        
        return {
            sessionDuration: Math.floor(sessionDuration / 1000), // in seconds
            timeSinceLastActivity: Math.floor(timeSinceLastActivity / 1000),
            sessionStartTime: new Date(sessionStartTime).toISOString(),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
    }, [sessionStartTime, lastActivityTime]);

    // Update last activity time on any interaction
    const updateActivity = useCallback(() => {
        setLastActivityTime(Date.now());
    }, []);

    const trackJobView = useCallback((jobId, metadata = {}) => {
        if (!user?.id || !jobId) return;
        
        updateActivity();
        trackInteractionMutation.mutate({
            jobId,
            interactionType: 'view',
            metadata: {
                ...metadata,
                ...getSessionMetadata(),
                timestamp: new Date().toISOString(),
                source: metadata.source || 'job_list',
                userId: user.id
            }
        });
    }, [trackInteractionMutation, user?.id, getSessionMetadata, updateActivity]);

    const trackJobClick = useCallback((jobId, metadata = {}) => {
        if (!user?.id || !jobId) return;
        
        updateActivity();
        trackInteractionMutation.mutate({
            jobId,
            interactionType: 'click',
            metadata: {
                ...metadata,
                ...getSessionMetadata(),
                timestamp: new Date().toISOString(),
                source: metadata.source || 'job_list',
                userId: user.id,
                action: metadata.action || 'view_details'
            }
        });
    }, [trackInteractionMutation, user?.id, getSessionMetadata, updateActivity]);

    const trackJobApplication = useCallback((jobId, metadata = {}) => {
        if (!user?.id || !jobId) return;
        
        updateActivity();
        trackInteractionMutation.mutate({
            jobId,
            interactionType: 'apply',
            metadata: {
                ...metadata,
                ...getSessionMetadata(),
                timestamp: new Date().toISOString(),
                source: metadata.source || 'job_list',
                userId: user.id,
                action: metadata.action || 'apply_click'
            }
        });
    }, [trackInteractionMutation, user?.id, getSessionMetadata, updateActivity]);

    const trackJobSave = useCallback((jobId, metadata = {}) => {
        if (!user?.id || !jobId) return;
        
        updateActivity();
        trackInteractionMutation.mutate({
            jobId,
            interactionType: 'save',
            metadata: {
                ...metadata,
                ...getSessionMetadata(),
                timestamp: new Date().toISOString(),
                source: metadata.source || 'job_list',
                userId: user.id,
                action: metadata.action || 'toggle_favorite'
            }
        });
    }, [trackInteractionMutation, user?.id, getSessionMetadata, updateActivity]);

    const trackJobShare = useCallback((jobId, metadata = {}) => {
        if (!user?.id || !jobId) return;
        
        trackInteractionMutation.mutate({
            jobId,
            interactionType: 'share',
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                source: metadata.source || 'job_list',
                userId: user.id,
                shareMethod: metadata.shareMethod || 'unknown'
            }
        });
    }, [trackInteractionMutation, user?.id]);

    const trackJobContact = useCallback((jobId, metadata = {}) => {
        if (!user?.id || !jobId) return;
        
        trackInteractionMutation.mutate({
            jobId,
            interactionType: 'contact',
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                source: metadata.source || 'job_list',
                userId: user.id
            }
        });
    }, [trackInteractionMutation, user?.id]);

    // Batch track multiple views (when loading a page with multiple jobs)
    const trackBatchViews = useCallback((jobIds, metadata = {}) => {
        if (!user?.id || !jobIds || jobIds.length === 0) return;
        
        const interactions = jobIds.map(jobId => ({
            missionId: jobId,
            interactionType: 'view',
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                source: metadata.source || 'job_list',
                userId: user.id,
                batchView: true,
                batchSize: jobIds.length
            }
        }));

        // Use the service's batch tracking method
        recommendationService.batchTrackInteractions(interactions)
            .catch(error => {
                console.error('Error batch tracking views:', error);
            });
    }, [user?.id]);

    // Track tab switching
    const trackTabSwitch = useCallback((fromTab, toTab, metadata = {}) => {
        if (!user?.id) return;
        
        trackInteractionMutation.mutate({
            jobId: 'system', // System-level interaction
            interactionType: 'navigation',
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                source: 'tab_switch',
                userId: user.id,
                fromTab,
                toTab,
                action: 'tab_change'
            }
        });
    }, [trackInteractionMutation, user?.id]);

    // Track search/filter actions
    const trackSearch = useCallback((searchTerm, filters = {}, metadata = {}) => {
        if (!user?.id) return;
        
        trackInteractionMutation.mutate({
            jobId: 'system',
            interactionType: 'search',
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                source: 'search',
                userId: user.id,
                searchTerm,
                filters,
                action: 'search_query'
            }
        });
    }, [trackInteractionMutation, user?.id]);

    // Track refresh actions
    const trackRefresh = useCallback((source, metadata = {}) => {
        if (!user?.id) return;
        
        updateActivity();
        trackInteractionMutation.mutate({
            jobId: 'system',
            interactionType: 'refresh',
            metadata: {
                ...metadata,
                ...getSessionMetadata(),
                timestamp: new Date().toISOString(),
                source: source || 'manual_refresh',
                userId: user.id,
                action: 'refresh_data'
            }
        });
    }, [trackInteractionMutation, user?.id, getSessionMetadata, updateActivity]);

    // Track session summary (useful for session end or periodic summaries)
    const trackSessionSummary = useCallback((additionalData = {}) => {
        if (!user?.id) return;
        
        const sessionMeta = getSessionMetadata();
        trackInteractionMutation.mutate({
            jobId: 'system',
            interactionType: 'session_summary',
            metadata: {
                ...additionalData,
                ...sessionMeta,
                timestamp: new Date().toISOString(),
                source: 'session_tracker',
                userId: user.id,
                action: 'session_summary',
                totalSessionTime: sessionMeta.sessionDuration
            }
        });
    }, [trackInteractionMutation, user?.id, getSessionMetadata]);

    // Auto-track session summary on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            trackSessionSummary({ reason: 'page_unload' });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [trackSessionSummary]);

    return {
        // Core tracking methods
        trackJobView,
        trackJobClick,
        trackJobApplication,
        trackJobSave,
        trackJobShare,
        trackJobContact,
        trackBatchViews,
        
        // System-level tracking
        trackTabSwitch,
        trackSearch,
        trackRefresh,
        trackSessionSummary,
        
        // Session utilities
        getSessionMetadata,
        updateActivity,
        sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
        timeSinceLastActivity: Math.floor((Date.now() - lastActivityTime) / 1000),
        
        // State
        isTracking: trackInteractionMutation.isLoading,
        isEnabled: !!user?.id,
        
        // Raw mutation for custom tracking
        trackCustomInteraction: trackInteractionMutation.mutate
    };
};

export default useJobTracking;
