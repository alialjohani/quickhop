import logger from "../utils/logger";

// src/errors/AppError.ts
export class AppError extends Error {
    public methodName: string;
    public statusCode: number;
    public isOperational: boolean;

    constructor(methodName: string, statusCode: number, message: string) {
        super(message);
        this.methodName = methodName;
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguish operational errors from programming errors

        // Maintain proper stack trace (only available on V8)
        Error.captureStackTrace(this, this.constructor);

        logger.error(
            `AppError occurred.\nMethod: ${methodName}\nStatus Code: ${statusCode}\nMessage: ${message}\nStack Trace: ${this.stack}`
        );
    }
}
