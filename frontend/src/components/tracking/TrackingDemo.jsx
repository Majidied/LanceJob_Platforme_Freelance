import React, { useState } from 'react';
import { Activity, Clock, Eye, MousePointer, Heart, Send } from 'lucide-react';
import useJobTracking from '../../hooks/useJobTracking';

const TrackingDemo = () => {
  const [demoJobId] = useState('demo-job-123');
  const {
    trackJobView,
    trackJobClick,
    trackJobApplication,
    trackJobSave,
    sessionDuration,
    timeSinceLastActivity,
    isTracking
  } = useJobTracking();

  const demoActions = [
    {
      name: 'Track View',
      icon: <Eye size={16} />,
      action: () => trackJobView(demoJobId, { action: 'demo_view', source: 'tracking_demo' }),
      description: 'Simulates viewing a job card'
    },
    {
      name: 'Track Click',
      icon: <MousePointer size={16} />,
      action: () => trackJobClick(demoJobId, { action: 'demo_click', source: 'tracking_demo' }),
      description: 'Simulates clicking on job details'
    },
    {
      name: 'Track Save',
      icon: <Heart size={16} />,
      action: () => trackJobSave(demoJobId, { action: 'demo_save', source: 'tracking_demo' }),
      description: 'Simulates saving/favoriting a job'
    },
    {
      name: 'Track Apply',
      icon: <Send size={16} />,
      action: () => trackJobApplication(demoJobId, { action: 'demo_apply', source: 'tracking_demo' }),
      description: 'Simulates applying to a job'
    }
  ];

  return (
    <div className="bg-white dark:bg-navy-800 rounded-lg p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-blue-500" size={20} />
        <h3 className="text-lg font-semibold dark:text-white">Live Tracking Demo</h3>
        {isTracking && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            Tracking Active
          </span>
        )}
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Session Duration</span>
          </div>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">Last Activity</span>
          </div>
          <p className="text-xl font-bold text-green-900 dark:text-green-100">
            {timeSinceLastActivity}s ago
          </p>
        </div>
      </div>

      {/* Demo Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Try these tracking actions:
        </h4>
        {demoActions.map((demo, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-gray-600 dark:text-gray-400">
                {demo.icon}
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {demo.name}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {demo.description}
                </p>
              </div>
            </div>
            <button
              onClick={demo.action}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
            >
              Track
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Live Demo:</strong> Each action above will send real tracking data to the analytics system. 
          Check the browser network tab to see the API calls being made!
        </p>
      </div>
    </div>
  );
};

export default TrackingDemo;
