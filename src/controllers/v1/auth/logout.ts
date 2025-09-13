import config from '@/config';
import { logger } from '@/lib/winston';
import Token from '@/models/token';

import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken as string;

    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });
      logger.info('Removed refresh token');

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.sendStatus(200);
      logger.info('Logged out');
    }

    res.send(204);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      code: 'Server error',
      error: error,
    });
    logger.error('error :', error);
  }
};

export default logout;
