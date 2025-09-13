import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

import { v2 as cloudinary } from 'cloudinary';
import Blog from '@/models/blog';

const deleteBlog = async (req: Request, res: Response) => {
  const userId = req.userId;
  const blogId = req.params.blogId;
  try {
    const user = await User.findById(userId).select('role').lean().exec();
    const blog = await Blog.findById(blogId)
      .select('author banner.publicId ')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorisationError',
        message: 'Invalid permission',
      });
      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);

    await Blog.deleteOne({ _id: blogId });

    res.status(204).json({
      message: 'Blog deleted successfully',
      blog,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
      error,
    });

    logger.error('Error creating blog');
  }
};

export default deleteBlog;
