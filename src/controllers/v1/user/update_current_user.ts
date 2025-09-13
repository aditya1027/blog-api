import { logger } from '@/lib/winston';
import User from '@/models/user';
import { Request, Response } from 'express';

const updateCurrentUser = async (req: Request, res: Response) => {
  const userId = req.userId;
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    website,
    x,
    linkedin,
    github,
    instagram,
    facebook,
    youtube,
  } = req.body;

  try {
    const user = await User.findById(userId).select('+password -__v').exec();

    if (!user) {
      res.status(404).json({
        code: 'ServerError',
        message: 'Internal Server error',
      });

      logger.error('Not able to get the user');
      return;
    }

    if (username) {
      user.username = username;
    }

    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    if (website) {
      user!.socialLinks!.website = website;
    }
    if (x) {
      user!.socialLinks!.x = x;
    }
    if (linkedin) {
      user!.socialLinks!.linkedin = linkedin;
    }
    if (github) {
      user!.socialLinks!.github = github;
    }
    if (instagram) {
      user!.socialLinks!.instagram = instagram;
    }
    if (facebook) {
      user!.socialLinks!.facebook = facebook;
    }
    if (youtube) {
      user!.socialLinks!.youtube = youtube;
    }

    await user.save();
    res.status(202).json({
      message: 'User updated successfully',
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        socialLinks: user.socialLinks,
      },
    });
    logger.info('User updated successfully');
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
      error,
    });
  }
};

export default updateCurrentUser;
