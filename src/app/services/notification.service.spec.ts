import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect notification support', () => {
    const isSupported = service.isSupported();
    expect(typeof isSupported).toBe('boolean');
  });

  it('should return permission status', () => {
    const status = service.getPermissionStatus();
    expect(['granted', 'denied', 'default']).toContain(status);
  });

  it('should schedule and retrieve notifications from localStorage', () => {
    const testId = 12345;
    const testTitle = 'Test Notification';
    const testBody = 'Test Body';
    const testTime = new Date(Date.now() + 60000); // 1 minute from now

    // Schedule a notification
    service.scheduleNotification(testId, testTitle, testBody, testTime);

    // Retrieve from localStorage directly to verify
    const stored = localStorage.getItem('scheduled_notifications');
    expect(stored).toBeTruthy();

    if (stored) {
      const notifications = JSON.parse(stored);
      const found = notifications.find((n: any) => n.id === testId);
      expect(found).toBeTruthy();
      expect(found.title).toBe(testTitle);
      expect(found.body).toBe(testBody);
    }

    // Cleanup
    localStorage.removeItem('scheduled_notifications');
  });

  it('should cancel scheduled notifications', () => {
    const testId = 54321;
    const testTitle = 'Test Notification';
    const testBody = 'Test Body';
    const testTime = new Date(Date.now() + 60000);

    // Schedule a notification
    service.scheduleNotification(testId, testTitle, testBody, testTime);

    // Cancel it
    service.cancelScheduledNotification(testId);

    // Verify it's removed
    const stored = localStorage.getItem('scheduled_notifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      const found = notifications.find((n: any) => n.id === testId);
      expect(found).toBeUndefined();
    }

    // Cleanup
    localStorage.removeItem('scheduled_notifications');
  });
});
