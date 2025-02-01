import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { sendErrorResponse } from '../utils/responseHandler';
import logger from '../utils/logger';

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.isOperational ? err.statusCode : 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';
    logger.error(`x-forwarded-for={${req.headers['x-forwarded-for']}}, statusCode={${statusCode}}, message={${message}}, res={${res}}`);
    sendErrorResponse(res, message, statusCode);
};
