# Web Push Notifications Architecture

## Overview

This application uses **Web Push Notifications** via the **Web Notifications API** and **Service Workers** to provide cross-platform notification support for PWAs (Progressive Web Apps) hosted over HTTPS.

This approach replaces the previous `@capacitor/local-notifications` implementation, which only worked in native builds, with a solution that works in:
- iOS Safari (iOS 16.4+)
- Android Chrome
- Desktop browsers
- Native builds (as a web view)

## Architecture Components

### 1. NotificationService (`src/app/services/notification.service.ts`)

The core notification service that provides:

- **Permission Management**: Request notification permission from users (ONLY after user interaction)
- **Immediate Notifications**: Show instant notifications via the Service Worker
- **Scheduled Notifications**: Store scheduled notifications in localStorage and check them periodically
- **Graceful Fallback**: Detect if notifications are not supported and fail gracefully

#### Key Features:

```typescript
// Check if notifications are supported
isSupported(): boolean

// Request permission (must be called from user action)
requestPermission(): Promise<boolean>

// Show immediate notification
showNotification(title: string, body: string, data?: any): Promise<void>

// Schedule a future notification
scheduleNotification(id: number, title: string, body: string, scheduledTime: Date): void

// Cancel a scheduled notification
cancelScheduledNotification(id: number): void
```

#### Scheduled Notification Strategy:

Since the Web Notifications API doesn't support native scheduling like Capacitor, we implement scheduling using:

1. **localStorage** - Store scheduled notifications with their trigger times
2. **setInterval** - Background checker runs every 30 seconds to check for due notifications
3. **Date comparison** - When current time >= scheduled time, trigger the notification
4. **Auto-cleanup** - Remove triggered notifications after 1 hour

**Limitations**: 
- Requires the browser tab to be open (or Service Worker to be active)
- On iOS, background refresh must be enabled
- Notifications may be delayed by up to 30 seconds

### 2. Service Worker (`src/custom-sw.js` + Angular Service Worker)

The Service Worker handles:

- **Notification Display**: Shows notifications even when the app is in the background
- **Notification Click**: Opens/focuses the app when a notification is clicked
- **Offline Support**: Via Angular Service Worker (ngsw)

The custom service worker extends Angular's built-in Service Worker with notification handling.

### 3. ShiftLogService (`src/app/services/shift-log.service.ts`)

Updated to use the new NotificationService instead of Capacitor LocalNotifications:

- Requests notification permission (delegated to user action)
- Schedules notifications when a reminder time is set on a note
- Cancels notifications when a note is deleted

### 4. UI Components

**Shift Log Page** (`src/app/pages/shift-log/shift-log.page.ts`):

- Displays a banner prompting users to enable notifications
- Only shows banner if:
  - Notifications are supported
  - Permission hasn't been granted yet
- Includes a button to request permission (user-initiated action)

## User Flow

### First Time User:

1. User opens the app
2. If notifications are supported and not yet authorized, a banner appears at the top
3. User clicks "Sta notificaties toe" (Allow notifications)
4. Browser shows native permission dialog
5. If granted, banner disappears and notifications are enabled

### Creating a Reminder:

1. User adds a note with a reminder time
2. Notification is scheduled in localStorage
3. Background checker monitors scheduled notifications
4. When time arrives, notification is shown via Service Worker
5. User clicks notification → app opens/focuses

### Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| **iOS Safari 16.4+** | ✅ Yes | Requires "Add to Home Screen" for best experience |
| **Android Chrome** | ✅ Yes | Full support for PWAs |
| **Desktop Chrome/Edge** | ✅ Yes | Full support |
| **Desktop Firefox** | ✅ Yes | Full support |
| **iOS < 16.4** | ❌ No | Web Notifications not supported |

## Important Limitations

### iOS Safari Specific:

1. **PWA Mode Required**: For best experience, users should "Add to Home Screen"
2. **Background Limits**: iOS may suspend background JavaScript after some time
3. **No True Background**: Notifications only trigger while app is active or Service Worker is running
4. **Permission Prompt**: Only appears after explicit user action (button click)

### General Limitations:

1. **Not True Native Scheduling**: Unlike native apps, scheduled notifications require periodic checking
2. **Browser Must Be Open**: On some platforms, the browser tab must be open (or Service Worker active)
3. **No Persistent Alarms**: If the device restarts or browser is closed for long periods, scheduled notifications may be missed
4. **30-Second Accuracy**: Notifications are checked every 30 seconds, so timing is not exact

## Security & Privacy

- **User Consent Required**: Notifications only work after explicit user permission
- **HTTPS Required**: Web Notifications API requires secure context (HTTPS)
- **No External Services**: All notification scheduling is local (no push server needed)
- **localStorage Only**: Scheduled notifications stored locally, not sent to any server

## Configuration Files

- **`ngsw-config.json`**: Angular Service Worker configuration
- **`angular.json`**: Service Worker enabled for production builds
- **`src/main.ts`**: Service Worker provider configured
- **`src/custom-sw.js`**: Custom Service Worker with notification handling

## Development vs Production

- **Development**: Service Worker is DISABLED (isDevMode() = true)
- **Production**: Service Worker is enabled automatically
- **Testing**: Use `ng build` and serve over HTTPS to test notifications

## Building for Production

```bash
# Build with Service Worker enabled
npm run build

# The output in www/ includes:
# - ngsw-worker.js (Angular Service Worker)
# - ngsw.json (Service Worker manifest)
```

## Clinical Use Case Considerations

For a clinical reminder app, consider:

1. ✅ **User Consent**: Permission requested explicitly via button click
2. ✅ **Graceful Degradation**: Falls back gracefully if notifications not supported
3. ✅ **Reliability**: Uses localStorage for persistence
4. ⚠️ **Timing Accuracy**: 30-second check interval may not be suitable for critical time-sensitive reminders
5. ⚠️ **Background Limitations**: Users should keep the app/tab open for best reliability

### Recommendations for Clinical Use:

- **Critical Reminders**: Consider alternative solutions for life-critical notifications
- **User Education**: Inform users about keeping the app open for reliable notifications
- **Fallback Systems**: Don't rely solely on push notifications for critical alerts
- **Testing**: Thoroughly test on target devices (especially iOS Safari)

## Troubleshooting

### Notifications Not Showing:

1. Check permission status: `navigator.permissions.query({name: 'notifications'})`
2. Verify HTTPS is enabled
3. Check browser console for errors
4. Ensure Service Worker is registered
5. For iOS: Ensure app is added to home screen

### Service Worker Not Registering:

1. Clear browser cache
2. Unregister old service workers in DevTools
3. Rebuild with production configuration
4. Check console for registration errors

### Scheduled Notifications Not Triggering:

1. Check localStorage for `scheduled_notifications` key
2. Verify background checker is running (console logs)
3. Ensure browser tab is open or Service Worker is active
4. Check system notification settings

## Future Enhancements

Potential improvements:

1. **Web Push API**: Add server-side push notifications for better reliability
2. **Better Scheduling**: Use Background Sync API where supported
3. **Notification Actions**: Add quick actions to notifications
4. **Notification Grouping**: Group related notifications
5. **Vibration Patterns**: Custom vibration for different priorities

## References

- [Web Notifications API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Angular Service Worker](https://angular.io/guide/service-worker-intro)
- [iOS Safari PWA Support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
