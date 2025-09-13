import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Blog, { IBlog } from '@/models/blog';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

type BlogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;

const createBlog = async (req: Request, res: Response) => {
  const { title, content, banner, status } = req.body as BlogData;
  const userId = req.userId;

  const cleanContent = purify.sanitize(content);

  const newBlog = await Blog.create({
    title,
    content: cleanContent,
    banner,
    status,
    author: userId,
  });

  logger.info('New Blog created successfully', newBlog);

  res.status(201).json({
    message: 'Blog created successfully',
    blog: newBlog,
  });

  try {
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
      error,
    });

    logger.error('Error creating blog');
  }
};

export default createBlog;
