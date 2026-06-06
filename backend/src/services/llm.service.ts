import axios from 'axios';
import config from '../config';

const ollamaClient = axios.create({
  baseURL: config.ollamaUrl,
  timeout: 120000,
});

interface AskLocalLLMOptions {
  format?: 'json';
  numPredict?: number;
}

export const askLocalLLM = async (
  prompt: string,
  options: AskLocalLLMOptions = {},
): Promise<string> => {
  const response = await ollamaClient.post('/api/generate', {
    model: config.ollamaModel,
    prompt,
    stream: false,
    ...(options.format ? { format: options.format } : {}),
    options: {
      num_predict: options.numPredict ?? 400,
      temperature: 0,
    },
  });
  if (!response.data?.response) {
    throw new Error('LLM did not return a response');
  }
  return response.data.response;
};

export const askVisionLLM = async (
  prompt: string,
  base64Images: string[],
  options: AskLocalLLMOptions = {},
): Promise<string> => {
  if (!config.ollamaVisionModel) {
    throw new Error('Missing OLLAMA_VISION_MODEL for image-based statement extraction');
  }

  const response = await ollamaClient.post('/api/generate', {
    model: config.ollamaVisionModel,
    prompt,
    images: base64Images,
    stream: false,
    ...(options.format ? { format: options.format } : {}),
    options: {
      num_predict: options.numPredict ?? 3000,
      temperature: 0,
    },
  });
  if (!response.data?.response) {
    throw new Error('Vision LLM did not return a response');
  }
  return response.data.response;
};

export const createEmbedding = async (text: string): Promise<number[]> => {
  const response = await ollamaClient.post('/api/embeddings', {
    model: config.embeddingModel,
    prompt: text,
  });
  return response.data?.embedding ?? [];
};
