import { Injectable, OnDestroy } from '@angular/core';

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  scheduledTime: Date;
  triggered: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly STORAGE_KEY = 'scheduled_notifications';
  private readonly NOTIFICATION_ICON = '/assets/icons/icon-192-V2.png';
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds
  private checkInterval: number | undefined;
  private permissionGranted = false;

  constructor() {
    this.initializePermissionStatus();
    this.startScheduledNotificationChecker();
    this.registerNotificationClickHandler();
  }

  /**
   * Register notification click handler via Service Worker
   */
  private registerNotificationClickHandler(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          // Handle notification click - could navigate to specific page
          console.log('Notification clicked:', event.data);
        }
      });
    }
  }

  /**
   * Check if notifications are supported in this browser
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Initialize permission status
   */
  private initializePermissionStatus() {
    if (this.isSupported()) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  /**
   * Request notification permission from the user
   * MUST be called after a user interaction (e.g., button click)
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission has been denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show an immediate notification
   */
  async showNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.permissionGranted) {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    try {
      // Try to use Service Worker if available
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, {
          body: body,
          icon: this.NOTIFICATION_ICON,
          badge: this.NOTIFICATION_ICON,
          data: data,
          tag: data?.id ? `notification-${data.id}` : undefined,
          requireInteraction: false
        });
      } else {
        // Fallback to regular Notification API
        new Notification(title, {
          body: body,
          icon: this.NOTIFICATION_ICON,
          data: data,
          tag: data?.id ? `notification-${data.id}` : undefined
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Schedule a notification for a future time
   * Uses localStorage to persist scheduled notifications
   */
  scheduleNotification(id: number, title: string, body: string, scheduledTime: Date): void {
    const notification: ScheduledNotification = {
      id,
      title,
      body,
      scheduledTime,
      triggered: false
    };

    const notifications = this.getScheduledNotifications();
    
    // Remove any existing notification with the same ID
    const filtered = notifications.filter(n => n.id !== id);
    filtered.push(notification);
    
    this.saveScheduledNotifications(filtered);
  }

  /**
   * Cancel a scheduled notification
   */
  cancelScheduledNotification(id: number): void {
    const notifications = this.getScheduledNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    this.saveScheduledNotifications(filtered);
  }

  /**
   * Get all scheduled notifications
   */
  private getScheduledNotifications(): ScheduledNotification[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed: ScheduledNotification[] = JSON.parse(data);
        // Convert date strings back to Date objects
        return parsed.map((n: ScheduledNotification) => ({
          ...n,
          scheduledTime: new Date(n.scheduledTime)
        }));
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
    return [];
  }

  /**
   * Save scheduled notifications to localStorage
   */
  private saveScheduledNotifications(notifications: ScheduledNotification[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  /**
   * Start background checker for scheduled notifications
   * Checks every 30 seconds if any notifications need to be triggered
   * Note: For clinical use cases requiring precise timing (< 30s accuracy),
   * consider alternative solutions like server-side push or reducing the interval
   */
  private startScheduledNotificationChecker(): void {
    // Check immediately
    this.checkScheduledNotifications();

    // Then check every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkScheduledNotifications();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Check if any scheduled notifications need to be triggered
   */
  private checkScheduledNotifications(): void {
    if (!this.permissionGranted) {
      return;
    }

    const now = new Date();
    const notifications = this.getScheduledNotifications();
    const toTrigger = notifications.filter(n => 
      !n.triggered && n.scheduledTime <= now
    );

    toTrigger.forEach(notification => {
      this.showNotification(notification.title, notification.body, { id: notification.id });
      
      // Mark as triggered
      notification.triggered = true;
    });

    if (toTrigger.length > 0) {
      this.saveScheduledNotifications(notifications);
      
      // Clean up old triggered notifications (older than 1 hour)
      this.cleanupOldNotifications();
    }
  }

  /**
   * Clean up old triggered notifications
   */
  private cleanupOldNotifications(): void {
    const notifications = this.getScheduledNotifications();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const cleaned = notifications.filter(n => 
      !n.triggered || n.scheduledTime > oneHourAgo
    );

    if (cleaned.length !== notifications.length) {
      this.saveScheduledNotifications(cleaned);
    }
  }

  /**
   * Clean up when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.checkInterval !== undefined) {
      window.clearInterval(this.checkInterval);
    }
  }
}
