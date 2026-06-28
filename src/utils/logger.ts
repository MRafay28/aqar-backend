import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'logs';

const transport: DailyRotateFile = new DailyRotateFile({
    filename: path.join(logDir, '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const transports: winston.transport[] = [
    transport,
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] ${level}: ${message}`;
            })
        )
    })
];

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), logFormat),
    transports
});

export default logger;
