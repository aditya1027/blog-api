import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import { Request, Response } from 'express';
import Comment, { IComment } from '@/models/comment';
import User from '@/models/user';

const getCommentsByBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const userIds = allComments.map((comment) => comment.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name')
      .lean()
      .exec();

    const commentsWithUser = allComments.map((comment) => {
      const user = users.find(
        (user) => user._id.toString() === comment.userId.toString(),
      );
      return {
        ...comment,
        user: user?.username,
      };
    });

    res.status(200).json({
      message: 'Blog comments fetched successfully',
      comments: commentsWithUser,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
    });
    logger.error('Error commenting on blog');
  }
};

export default getCommentsByBlog;
