import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';
import config from './config';

dotenv.config();

const port = config.port;
const mongoUri = config.mongoUri;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log(`🚀 Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
