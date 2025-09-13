import mongoose from 'mongoose';

import config from '@/config';

import type { ConnectOptions } from 'mongoose';
import { logger } from '@/lib/winston';

const clientOptions: ConnectOptions = {
  dbName: 'blog-db',
  appName: 'Blog API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error('MongoDb URI not defined');
  }
  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    logger.info('Connected to the database successfully ...');
  } catch (error) {
    logger.error('Error connecting to DB :', error);
    if (error instanceof Error) throw new Error(error.message);
  }
};

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.warn('Disconnected from DB successfully.... ');
  } catch (error) {
    logger.error('error :', error);
    if (error instanceof Error) throw new Error(error.message);
  }
};
