import { api } from './api';

export const fetchDashboardAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const fetchInsights = async () => {
  const response = await api.get('/analytics/insights');
  return response.data.insights;
};
