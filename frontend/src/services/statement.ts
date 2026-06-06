import { api } from './api';

export const uploadStatement = async (file: File) => {
  const formData = new FormData();
  formData.append('statement', file);
  const response = await api.post('/statements/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchHistory = async () => {
  const response = await api.get('/statements/history');
  return response.data.history;
};
