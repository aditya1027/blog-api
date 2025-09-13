import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import type { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { Types } from 'mongoose';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied',
    });
    return;
  }

  const [_, token] = authHeader.split(' ');

  try {
    //Verify the token and extract userId
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    //Attach userId to req for later user
    req.userId = jwtPayload.userId;

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired',
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid Access token',
      });
      return;
    }

    res.status(401).json({
      code: 'ServerError',
      message: 'Internal server error',
    });

    logger.error('Error in token');
  }
};

export default authenticate;
