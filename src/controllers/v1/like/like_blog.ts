import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import Like from '@/models/like';
import { Request, Response } from 'express';

const likeBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const { userId } = req.body;

  try {
    const blog = await Blog.findById(blogId).select('likesCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    const existingLike = await Like.findOne({ blogId, userId }).exec();
    if (existingLike) {
      res.status(400).json({
        code: 'BadRequestError',
        message: 'Blog already liked',
      });
      return;
    }

     await Like.create({ blogId, userId });

    blog.likesCount++;
    await blog.save();

    res.status(201).json({
      message: 'Blog liked successfully',
      likeCount: blog.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
    });
    logger.error('Error liking blog');
  }
};

export default likeBlog;
