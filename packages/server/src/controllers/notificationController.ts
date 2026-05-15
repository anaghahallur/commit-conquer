/**
 * packages/server/src/controllers/notificationController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  constructor(private service: NotificationService) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const data = await this.service.getForUser(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.markAsRead(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
