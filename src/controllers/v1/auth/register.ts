import { logger } from '@/lib/winston';
import config from '@/config';

import type { Request, Response } from 'express';
import User from '@/models/user';
import type { IUser } from '@/models/user';
import { genUsername } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import Token from '@/models/token';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  if(role === 'admin' && !config.WHITELIST_ADMIN_MAIL.includes(email)){
    res.status(403).json({
        code:'Unauthorized',
        message: 'You cannot register as an admin'
    })
  }

  try {
    const username = genUsername();
    const newUser = await User.create({ username, email, password, role });

    //Generate access token and refresh token
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    //Store refresh token in db
    await Token.create({ token: refreshToken, userId: newUser._id });
    logger.info('Refresh token saved', {
      userId: newUser._id,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      message: 'New user created',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    logger.info('User registered successfully', newUser);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      code: 'Server error',
      error: error,
    });
    logger.error('error :', error);
  }
};

export default register;
