import deleteUserById from '@/controllers/v1/user/delete_current_user';
import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';
import getAllUsers from '@/controllers/v1/user/get_all_users';
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import getUserById from '@/controllers/v1/user/get_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import User from '@/models/user';
import { Router } from 'express';
import { param, query, body } from 'express-validator';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .isLength({ max: 30 })
    .withMessage('Username must be at max 30 characters')
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });
      console.log('userExists :', userExists);
      if (userExists) {
        throw new Error('Username already exists');
      }
    }),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('Email already exists');
      }
    }),
  body('password')
    .optional()
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .isLength({ max: 30 })
    .withMessage('Password must be at max 30 characters'),
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .isLength({ min: 3 })
    .withMessage('First name must be at least 3 characters')
    .isLength({ max: 30 })
    .withMessage('First name must be at max 30 characters'),
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .isLength({ min: 3 })
    .withMessage('Last name must be at least 3 characters')
    .isLength({ max: 30 })
    .withMessage('Last name must be at max 30 characters'),
  body([
    'website',
    'x',
    'linkedin',
    'github',
    'instagram',
    'facebook',
    'youtube',
  ])
    .optional()
    .isURL()
    .withMessage('Invalid URL')
    .isLength({ max: 100 })
    .withMessage('Website must be at max 100 characters'),
  validationError,
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be an integer'),
  validationError,
  getAllUsers,
);

router.get(
    '/:userId',
    authenticate,
    authorize(['admin']),
    param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
    validationError,
    getUserById,
)

router.delete(
    '/:userId',
    authenticate,
    authorize(['admin']),
    param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
    validationError,
    deleteUserById,
)

export default router;
