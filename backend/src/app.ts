import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './routes/auth.routes';
import statementRoutes from './routes/statement.routes';
import transactionRoutes from './routes/transaction.routes';
import analyticsRoutes from './routes/analytics.routes';
import chatRoutes from './routes/chat.routes';
import ragRoutes from './routes/rag.routes';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(rateLimiter);
app.use('/uploads', express.static('uploads'));

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Finance AI Copilot API',
    version: '1.0.0',
    description: 'Local-first personal finance backend',
  },
  servers: [{ url: 'http://localhost:5000' }],
};
const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rag', ragRoutes);

app.use(errorHandler);

export default app;
