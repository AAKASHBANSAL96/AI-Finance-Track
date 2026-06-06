import { api } from './api';

export const fetchTransactions = async (params: Record<string, string | number>) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};
