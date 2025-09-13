import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import User from '@/models/user';
import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);
    await cloudinary.api.delete_resources(publicIds);
    await Blog.deleteMany({ author: userId });

    const user = await User.findById(userId).select('+password -__v').exec();
    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });

      logger.error('Not able to get the user');
      return;
    }

    await User.deleteOne({ _id: userId });
    res.status(200).json({
      message: 'User deleted successfully',
    });
    logger.info('User deleted successfully');
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server error',
      error,
    });

    logger.error('Not able to delete the user');
  }
};

export default deleteUserById;
