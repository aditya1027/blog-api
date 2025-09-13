import { Router } from 'express';
import { body, cookie } from 'express-validator';
import bcrypt from 'bcrypt';

import register from '@/controllers/v1/auth/register';

//Middlewares
import validationError from '@/middlewares/validationError';
import User from '@/models/user';
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import logout from '@/controllers/v1/auth/logout';
import authenticate from '@/middlewares/authenticate';

const router = Router();

router.post(
  '/register',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characaters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('User already exists');
      }
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be min 8 characaters'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string')
    .isIn(['admin', 'user'])
    .withMessage('Role  must be admin or user'),
  validationError,
  register,
);

router.post(
  '/login',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characaters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (!userExists) {
        throw new Error('User email or password is invalid');
      }
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be min 8 characaters')
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select('password')
        .lean()
        .exec();

      if (!user) {
        throw new Error('Email or password invalid');
      }

      const passwordMatch = await bcrypt.compare(value, user.password);

      if (!passwordMatch) {
        throw new Error('Email or password invalid');
      }
    }),
  login,
);

router.post(
  '/refresh-token',
  cookie('refreshToken')
    .notEmpty()
    .withMessage('No refresh token present')
    .isJWT()
    .withMessage('Invalid refresh tokeb'),
  validationError,
  refreshToken,
);

router.post('/logout', authenticate, logout);

export default router;
