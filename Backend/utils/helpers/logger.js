import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; 
const { createLogger, format, transports } = winston;

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new DailyRotateFile({
      level: 'error', 
      filename: 'logs/error_log_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d' 
    }),
    new DailyRotateFile({
      level: 'info', 
      filename: 'logs/activity_log_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d' 
    }),
  ],
  
});

export default logger;
