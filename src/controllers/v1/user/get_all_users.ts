import config from '@/config';
import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) ?? config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) ?? config.defaultResOffset;

    const total = await User.countDocuments();

    const users = await User.find()
      .skip(offset)
      .limit(limit)
      .select('-__v')
      .lean()
      .exec();

    res.status(200).json({
      users,
      total,
      limit,
      offset,
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

export default getAllUsers;
