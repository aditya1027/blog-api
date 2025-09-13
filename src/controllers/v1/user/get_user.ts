import config from '@/config';
import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('-__v -password -createdAt -updatedAt').exec();

    if (!user) {
      res.status(404).json({
        code: 'ServerError',
        message: 'Internal Server error',
      });
      return
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(404).json({
      code: 'ServerError',
      message: 'Internal Server error',
      error,
    });

    logger.error('Not able to get the user');
  }
};

export default getUserById;
