import Token from '@/models/token';
import User from '@/models/user';

import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import config from '@/config';

type UserData = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as UserData;
  try {
    const user = await User.findOne({ email })
      .select('username password email role')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFOund',
        message: 'User not found',
      });
      return;
    }

    //Generate access token and refresh token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    //Store refresh token in db
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info('Refresh token saved', {
      userId: user._id,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      message: 'New user created',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info('User logged in successfully', user);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      code: 'Server error',
      error: error,
    });
    logger.error('error :', error);
  }
};

export default login;
