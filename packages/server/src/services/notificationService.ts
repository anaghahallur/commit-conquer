/**
 * packages/server/src/services/notificationService.ts
 */

export type NotificationType = 'OVERTAKEN' | 'ACHIEVEMENT' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
  read: boolean;
}

let store: Notification[] = [];
let idCounter = 0;

export class NotificationService {
  async create(data: {
    userId: string;
    message: string;
    type: NotificationType;
  }): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${++idCounter}`,
      userId: data.userId,
      message: data.message,
      type: data.type,
      createdAt: new Date(),
      read: false,
    };

    store.push(notification);
    return notification;
  }

  async getForUser(userId: string): Promise<Notification[]> {
    return store
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<void> {
    const notif = store.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  /** Test helper — resets the store. */
  _reset(): void {
    store = [];
    idCounter = 0;
  }
}
