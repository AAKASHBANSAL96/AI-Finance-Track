import { api } from './api';

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export const loginUser = async (email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
  return response.data;
};
