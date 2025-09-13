import { logger } from '@/lib/winston';
import User from '@/models/user';
import { NextFunction, Request, Response } from 'express';

export type AuthRole = 'admin' | 'user';

const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        res.status(404).json({
          code: 'NotFound',
          message: 'User not found',
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          code: 'AuthorizationError',
          message: 'Access Denied, insufficient permission',
        });
        return;
      }

      return next();
    } catch (error) {
      res.status(404).json({
        code: 'ServerError',
        message: 'Server error',
      });
    }
  };
};

export default authorize;
