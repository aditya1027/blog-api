import config from '@/config';
import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import User from '@/models/user';
import { Request, Response } from 'express';

const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    const user = await User.findById(userId).select('role').lean().exec();

    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt ,-__v')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    //Show only published post to normal user
    if (user?.role === 'user' && blog.status === 'draft') {
      res.status(403).json({
        code: 'AuthorixationError',
        message: 'Invalid permission',
      });
      return;
    }

    res.status(200).json({
      blog,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
      error,
    });

    logger.error('Not able to get the blogs by slug', error);
  }
};

export default getBlogBySlug;
