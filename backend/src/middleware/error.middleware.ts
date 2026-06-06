import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  const status = (err as any).status || 500;
  res.status(status).json({
    error: true,
    message: (err as any).message || 'Internal server error',
  });
};
