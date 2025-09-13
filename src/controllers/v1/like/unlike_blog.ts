import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import Like from '@/models/like';
import { Request, Response } from 'express';

const unlikeBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const { userId } = req.body;

  try {
    const existingLike = await Like.findOne({ blogId, userId }).exec();

    if (!existingLike) {
      res.status(400).json({
        code: 'BadRequestError',
        message: 'Blog not liked',
      });
      return;
    }

    await Like.deleteOne({ _id: existingLike?._id });

    const blog = await Blog.findById(blogId).select('likesCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    blog.likesCount--;
    await blog.save();

    res.status(200).json({
      message: 'Blog unliked successfully',
      likeCount: blog.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
    });
    logger.error('Error unliking blog');
  }
};

export default unlikeBlog;
