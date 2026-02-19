import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ForbiddenError } from '../utils/errors';

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};
