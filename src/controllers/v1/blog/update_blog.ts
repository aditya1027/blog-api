import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Blog, { IBlog } from '@/models/blog';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

type BlogData = Partial<Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>>;

const updateBlog = async (req: Request, res: Response) => {
  const { title, content, banner, status } = req.body as BlogData;
  const userId = req.userId;
  const blogId = req.params.blogId;
  try {
    const user = await User.findById(userId).select('role').lean().exec();
    const blog = await Blog.findById(blogId).select('-__v').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'Blog not found',
      });
      return;
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorixationError',
        message: 'Invalid permission',
      });
      return;
    }

    if (title) blog.title = title;

    if (content) {
      const cc = purify.sanitize(content);

      blog.content = cc;
    }

    if (banner) {
      blog.banner = banner;
    }

    if (status) blog.status = status;

    await blog.save();

    logger.info('Blog updated successfully');

    res.status(201).json({
      message: 'Blog created successfully',
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

export default updateBlog;
