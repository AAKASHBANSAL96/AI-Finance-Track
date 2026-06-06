import { api } from './api';

export const sendChatPrompt = async (prompt: string) => {
  const response = await api.post('/chat', { prompt });
  return response.data.reply;
};
