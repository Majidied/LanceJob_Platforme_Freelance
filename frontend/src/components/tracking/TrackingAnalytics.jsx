import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TrackingAnalytics = ({ trackingData = [], isVisible = false, onClose }) => {
  const [analytics, setAnalytics] = useState({
    totalInteractions: 0,
    interactionsByType: [],
    topSkills: [],
    engagementMetrics: {},
    timeDistribution: []
  });

  useEffect(() => {
    if (trackingData.length > 0) {
      processTrackingData(trackingData);
    }
  }, [trackingData]);

  const processTrackingData = (data) => {
    // Count interactions by type
    const interactionCounts = data.reduce((acc, interaction) => {
      const type = interaction.interactionType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const interactionsByType = Object.entries(interactionCounts).map(([type, count]) => ({
      type,
      count
    }));

    // Extract top skills from skill clicks
    const skillClicks = data.filter(i => i.metadata?.action === 'skill_click');
    const skillCounts = skillClicks.reduce((acc, interaction) => {
      const skill = interaction.metadata?.skill;
      if (skill) {
        acc[skill] = (acc[skill] || 0) + 1;
      }
      return acc;
    }, {});

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Calculate engagement metrics
    const hoverEvents = data.filter(i => i.metadata?.engagementType === 'hover');
    const clickEvents = data.filter(i => i.interactionType === 'click');
    const applyEvents = data.filter(i => i.interactionType === 'apply');
    const saveEvents = data.filter(i => i.interactionType === 'save');

    const engagementMetrics = {
      hoverRate: hoverEvents.length,
      clickRate: clickEvents.length,
      applyRate: applyEvents.length,
      saveRate: saveEvents.length,
      conversionRate: applyEvents.length > 0 ? (applyEvents.length / clickEvents.length * 100).toFixed(2) : 0
    };

    // Time distribution (by hour)
    const timeDistribution = data.reduce((acc, interaction) => {
      const hour = new Date(interaction.metadata?.timestamp || Date.now()).getHours();
      const hourKey = `${hour}:00`;
      acc[hourKey] = (acc[hourKey] || 0) + 1;
      return acc;
    }, {});

    const timeDistributionArray = Object.entries(timeDistribution).map(([hour, count]) => ({
      hour,
      count
    }));

    setAnalytics({
      totalInteractions: data.length,
      interactionsByType,
      topSkills,
      engagementMetrics,
      timeDistribution: timeDistributionArray
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-navy-800 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Job Interaction Analytics</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Interactions</h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalInteractions}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Hovers</h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.engagementMetrics.hoverRate}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Clicks</h3>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{analytics.engagementMetrics.clickRate}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Applications</h3>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.engagementMetrics.applyRate}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Conversion Rate</h3>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{analytics.engagementMetrics.conversionRate}%</p>
            </div>
          </div>

          {/* Interaction Types Chart */}
          <div className="bg-gray-50 dark:bg-navy-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Interactions by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.interactionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.interactionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Skills */}
          <div className="bg-gray-50 dark:bg-navy-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Most Clicked Skills</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSkills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="skill" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Distribution */}
          <div className="lg:col-span-2 bg-gray-50 dark:bg-navy-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Activity by Time of Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>This analytics dashboard shows real-time interaction data to help improve job recommendations and user experience.</p>
        </div>
      </div>
    </div>
  );
};

export default TrackingAnalytics;
