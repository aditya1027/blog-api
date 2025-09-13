import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import Like from '@/models/like';
import { Request, Response } from 'express';
import Comment, { IComment } from '@/models/comment';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

type CommentData = Pick<IComment, 'content'>;

const commentOnBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const { content } = req.body as CommentData;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    const cleanContent = purify.sanitize(content as string);

    const newComment = await Comment.create({
      blogId,
      userId,
      content: cleanContent,
    });

    blog.commentsCount++;
    await blog.save();

    res.status(201).json({
      message: 'Blog commented successfully',
      commentCount: blog.commentsCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
    });
    logger.error('Error commenting on blog');
  }
};

export default commentOnBlog;
