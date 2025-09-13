import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import { Request, Response } from 'express';
import Comment, { IComment } from '@/models/comment';
import User from '@/models/user';

const deleteComment = async (req: Request, res: Response) => {
  const currentUser = req.userId;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId)
      .select('userId blogId')
      .exec();
    const user = await User.findById(currentUser).select('role').exec();

    if (!comment) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Comment not found',
      });
      return;
    }
    if (comment.userId !== currentUser && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Invalid permission',
      });
      return;
    }

    if (!comment.blogId) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Comment not found',
      });
      return;
    }

    await Comment.deleteOne({ _id: commentId });

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    blog.commentsCount--;
    await blog.save();

    res.status(200).json({
      message: 'Comment deleted successfully',
      commentCount: blog.commentsCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
    });
    logger.error('Error deleting comment');
  }
};

export default deleteComment;
