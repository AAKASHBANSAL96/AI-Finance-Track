import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'OLLAMA_API_URL',
  'OLLAMA_MODEL',
  'EMBEDDING_MODEL',
  'QDRANT_URL',
  'QDRANT_COLLECTION',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export default {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  ollamaUrl: process.env.OLLAMA_API_URL as string,
  ollamaModel: process.env.OLLAMA_MODEL as string,
  ollamaVisionModel: process.env.OLLAMA_VISION_MODEL,
  embeddingModel: process.env.EMBEDDING_MODEL as string,
  qdrantUrl: process.env.QDRANT_URL as string,
  qdrantCollection: process.env.QDRANT_COLLECTION as string,
};
