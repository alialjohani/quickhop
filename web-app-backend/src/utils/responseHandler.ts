// utils/responseHandler.ts

import { Response } from 'express';
import { ApiResponse } from '../interfaces/common';

export const sendSuccessResponse = <T>(
    res: Response,
    message: string,
    data?: T,           // `data` is generic and flexible
    statusCode: number = 200
): Response<ApiResponse<T>> => {
    const response: ApiResponse<T> = {
        status: 'success',
        message,
        data,
    };
    return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
    res: Response,
    message: string,
    statusCode: number = 500
): Response<ApiResponse<null>> => {
    const response: ApiResponse<null> = {
        status: 'error',
        message,
    };
    return res.status(statusCode).json(response);
};
