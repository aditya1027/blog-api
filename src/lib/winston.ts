import winston from 'winston';
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

//Define the transports array to hold diff logging transports
const transports: winston.transport[] = [];

//If the app is not running in production, add a console transport
if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        align(), //Align log messages
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
  );
}

const logger = winston.createLogger({
    level: config.LOG_LEVEL || 'info', //Set default level to info
    format: combine(timestamp() , errors({stack:true }) , json()), // User JSOn format for logs
    transports,
    silent: config.NODE_ENV === 'test', //Disable logging in test environemnt
})

export {logger}
