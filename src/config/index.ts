import dotenv from 'dotenv';
import type ms from 'ms';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite default
    'http://localhost:8080', // Common dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ],
  MONGO_URI: process.env.MONGO_URI,
  LOG_LEVEL: process?.env.LOG_LEVEL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as ms.StringValue,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as ms.StringValue,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  WHITELIST_ADMIN_MAIL:[
    'aditya@gmail.com'
  ],
  defaultResLimit:20,
  defaultResOffset:0,
  CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY :process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET

};

export default config;
