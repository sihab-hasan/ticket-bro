'use strict';

class NotificationDTO {
  static fromEntity(notification) {
    if (!notification) return null;

    return {
      id: notification._id?.toString() || notification.id,
      user: notification.user?.toString() || notification.user,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead || false,
      readAt: notification.readAt,
      link: notification.link,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  static fromEntities(notifications) {
    return (notifications || []).map(this.fromEntity);
  }

  static toCreateInput(data) {
    return {
      user: data.userId || data.user,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      link: data.link || '',
    };
  }

  static toUpdatePreferencesInput(data) {
    return {
      email: {
        bookingConfirmed: data['email.bookingConfirmed'] ?? true,
        bookingCancelled: data['email.bookingCancelled'] ?? true,
        paymentSuccess: data['email.paymentSuccess'] ?? true,
        refundProcessed: data['email.refundProcessed'] ?? true,
        eventUpdated: data['email.eventUpdated'] ?? true,
        promotions: data['email.promotions'] ?? false,
        newsletter: data['email.newsletter'] ?? false,
      },
      push: {
        bookingReminder: data['push.bookingReminder'] ?? true,
        newEvents: data['push.newEvents'] ?? false,
      },
      soundEnabled: data.soundEnabled ?? true,
    };
  }

  static formatForResponse(notification, pagination = null) {
    const dto = this.fromEntity(notification);
    
    if (pagination) {
      return {
        notifications: dto,
        pagination,
      };
    }
    
    return dto;
  }

  static formatListResponse(notifications, pagination) {
    return {
      notifications: this.fromEntities(notifications),
      pagination,
      total: pagination?.total || notifications.length,
    };
  }
}

class NotificationPreferencesDTO {
  static fromEntity(prefs) {
    if (!prefs) {
      return this.getDefaults();
    }

    return {
      email: {
        bookingConfirmed: prefs.email?.bookingConfirmed ?? true,
        bookingCancelled: prefs.email?.bookingCancelled ?? true,
        paymentSuccess: prefs.email?.paymentSuccess ?? true,
        refundProcessed: prefs.email?.refundProcessed ?? true,
        eventUpdated: prefs.email?.eventUpdated ?? true,
        promotions: prefs.email?.promotions ?? false,
        newsletter: prefs.email?.newsletter ?? false,
      },
      push: {
        bookingReminder: prefs.push?.bookingReminder ?? true,
        newEvents: prefs.push?.newEvents ?? false,
      },
      soundEnabled: prefs.soundEnabled ?? true,
    };
  }

  static getDefaults() {
    return {
      email: {
        bookingConfirmed: true,
        bookingCancelled: true,
        paymentSuccess: true,
        refundProcessed: true,
        eventUpdated: true,
        promotions: false,
        newsletter: false,
      },
      push: {
        bookingReminder: true,
        newEvents: false,
      },
      soundEnabled: true,
    };
  }

  static toDbFormat(prefs) {
    return {
      email: prefs.email,
      push: prefs.push,
      soundEnabled: prefs.soundEnabled,
      updatedAt: new Date(),
    };
  }
}

class PushSubscriptionDTO {
  static fromRequest(body) {
    return {
      endpoint: body.endpoint,
      keys: {
        p256dh: body.keys?.p256dh,
        auth: body.keys?.auth,
      },
      expirationTime: body.expirationTime || null,
    };
  }

  static validate(subscription) {
    return (
      subscription &&
      subscription.endpoint &&
      subscription.keys &&
      subscription.keys.p256dh &&
      subscription.keys.auth
    );
  }
}

module.exports = {
  NotificationDTO,
  NotificationPreferencesDTO,
  PushSubscriptionDTO,
};