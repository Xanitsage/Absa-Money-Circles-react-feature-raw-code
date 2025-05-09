import winston from 'winston';
import { format } from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports to use
const transports = [
  // Write all logs to console
  new winston.transports.Console(),
  
  // Write all errors to error.log
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  
  // Write all logs to combined.log
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
});

// Add request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  logger.http(`${req.method} ${req.url}`);
  next();
};

// Add error logging middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(err);
};