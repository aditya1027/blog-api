import config from '@/config';
import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import User from '@/models/user';
import { Request, Response } from 'express';

interface QueryType {
  status?: 'draft' | 'published';
}

const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) ?? config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) ?? config.defaultResOffset;

    const total = await Blog.countDocuments();

    const user = await User.findById(userId).select('role').lean().exec();
    const query: QueryType = {};

    //Show only published post to normal user
    if (user?.role === 'user') {
      query.status = 'published';
    }

    const blogs = await Blog.find(query)
      .skip(offset)
      .limit(limit)
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt ,-__v')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      blogs,
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

    logger.error('Not able to get the blogs', error);
  }
};

export default getAllBlogs;
