import { Request, Response, NextFunction } from "express";
import { ErrorMessages } from "../utils/constants/error.constants";

export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  constructor(errorCode: string, message?: string, statusCode: number = 500) {
    super(message || ErrorMessages[errorCode as keyof typeof ErrorMessages] || "An unexpected error occurred");
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.errorCode
    ? ErrorMessages[err.errorCode as keyof typeof ErrorMessages] || err.message
    : err.message || ErrorMessages.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    message: errorMessage,
  });
};
