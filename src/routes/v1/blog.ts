import createBlog from '@/controllers/v1/blog/create_blog';
import deleteBlog from '@/controllers/v1/blog/delete_blog';
import getAllBlogs from '@/controllers/v1/blog/get_all_blogs';
import getBlogBySlug from '@/controllers/v1/blog/get_blog_by_slug';
import getBlogsByUser from '@/controllers/v1/blog/get_blogs_by_user';
import updateBlog from '@/controllers/v1/blog/update_blog';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import validationError from '@/middlewares/validationError';
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';

const router = Router();

const upload = multer();

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  uploadBlogBanner('post'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Max length 100'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Draft or published'),
  validationError,
  createBlog,
);

router.get(
  '/',
  authenticate,
  authorize(['admin', 'user']),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be an integer'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be an integer'),
  validationError,
  getAllBlogs,
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(['admin', 'user']),
  param('userId').isMongoId().withMessage('Invalid userId'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be an integer'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be an integer'),
  validationError,
  getBlogsByUser,
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  param('slug').notEmpty().withMessage('Slug required'),
  validationError,
  getBlogBySlug,
);

router.put(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  param('blogId').notEmpty().withMessage('BlogId required'),
  upload.single('banner-image'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Max length 100'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Draft or published'),
  validationError,
  uploadBlogBanner('put'),
  updateBlog

);

router.delete(
    '/:blogId',
    authenticate,
    authorize(['admin']),
    deleteBlog,
)

export default router;
