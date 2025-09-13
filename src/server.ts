import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import config from '@/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import type { CorsOptions } from 'cors';
import limiter from '@/lib/epress_rate_limit';


import v1Routes from '@/routes/v1';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';


import { logger } from '@/lib/winston';


// Express app initial
const app = express();


//Configure CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error'), false);
      logger.warn('CORS ERROR');
    }
  },
};

//Apply cors middleware
//app.use(cors(corsOptions));
app.use(cors());

//Enable JSON request body parsing
app.use(express.json());

//enable URL-encoded request body with extended mode
//extended allows rich objects and arrays
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1kb
  }),
);

//Use helmet to enhance security by setting various HTTP headers
app.use(helmet());

//Apply rate limit middleware to prevent excessive requests and enhance security
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server :', error);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server shutdown');
    process.exit(1);
  } catch (error) {
    logger.error('error during SHUTDOWN');
  }
};

// Listens for termination signals
// SIGERM - kill command
// SIGINT - Ctrl + C or some user interference
process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
