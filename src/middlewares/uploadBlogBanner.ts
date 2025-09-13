import uploadToCloudinary from '@/lib/cloudinary';
import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import { UploadApiErrorResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const uploadBlogBanner = (method: 'post' | 'put') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (method === 'put' && !req.file) {
      next();
      return;
    }

    if (!req.file) {
      res.status(400).json({
        code: 'ValidationError',
        message: 'Blog banner is required',
      });

      return;
    }

    if (req.file.size > MAX_FILE_SIZE) {
      res.status(400).json({
        code: 'ValidationError',
        message: 'Max banner file size 2mb',
      });

      return;
    }

    try {
      const { blogId } = req.params;
      const blog = await Blog.findById(blogId).select('banner.publicId').exec();

      const data = await uploadToCloudinary(
        req.file.buffer,
        blog?.banner?.publicId.replace('blog-api/', ''),
      );

      if (!data) {
        res.status(500).json({
          code: 'ServerError',
          message: 'Internal Server error',
        });

        logger.error('Error while uploading banner to cloudinary', {
          blogId,
        });
        return;
      }

      const newBanner = {
        publicId: data?.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      logger.info('Banner successfully uploaded', {
        blogId,
        banner: newBanner,
      });

      req.body.banner = newBanner;

      next();
    } catch (error: UploadApiErrorResponse | any) {
      res.status(error.http.code).json({
        code: error.http.code < 500 ? 'ValidationError' : error.name,
        message: error.message,
      });
    }
  };
};

export default uploadBlogBanner;
