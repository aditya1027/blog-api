import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-__v').lean().exec();
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

export default getCurrentUser;
