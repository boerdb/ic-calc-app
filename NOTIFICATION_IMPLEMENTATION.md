# Local Notifications Implementation Guide

## Overview
This document describes the robust local notifications implementation for the Smart Notes app using `@capacitor/local-notifications` for native mobile (iOS/Android) and Web Notifications API for PWA (web browsers).

## Key Features

### ✅ Cross-Platform Support
- **Native Mobile**: iOS and Android using Capacitor LocalNotifications
- **PWA (Progressive Web App)**: Web browsers using Web Notifications API
- Automatic platform detection and appropriate API selection

### ✅ Android 13+ Support
- **POST_NOTIFICATIONS** permission handling
- **SCHEDULE_EXACT_ALARM** permission for precise timing
- High Priority notification channel (Importance 5)
- Proper permissions declared in AndroidManifest.xml

### ✅ Cross-Platform Compatibility
- Works on Android (all versions)
- Works on iOS
- Works as PWA in web browsers (Chrome, Edge, Firefox, Safari)
- Handles platform-specific requirements automatically

### ✅ Robust Implementation
- System default sound (no custom audio files that could crash iOS)
- Date validation to ensure notifications are scheduled in the future
- Automatic adjustment for past dates
- Comprehensive error handling and logging
- Works when app is closed, backgrounded, or phone is locked (mobile)
- Works with browser notifications (PWA)

## Technical Implementation

### ShiftLogService Changes

#### 1. Platform Detection
```typescript
private platform = Capacitor.getPlatform();
private isAndroid = this.platform === 'android';
private isIOS = this.platform === 'ios';
private isWeb = this.platform === 'web';
```

The service automatically detects the platform:
- **'web'**: Running as PWA in browser
- **'android'**: Running as native Android app
- **'ios'**: Running as native iOS app

#### 2. Initialization Flow
```typescript
constructor() {
  this.initializeNotifications();
}

private async initializeNotifications() {
  await this.requestPermissions();
  if (this.isAndroid) {
    await this.createNotificationChannel();
  }
}
```

#### 3. Permission Handling

**For PWA (Web):**
```typescript
if (this.isWeb) {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    // 'granted', 'denied', or 'default'
  }
}
```

**For Native Mobile:**
```typescript
const permResult = await LocalNotifications.requestPermissions();
// Checks for exact alarm permission on Android
if (this.isAndroid) {
  await this.checkAndroidExactAlarmPermission();
}
```

#### 4. Android High Priority Channel
```typescript
await LocalNotifications.createChannel({
  id: 'smart_notes_high_priority',
  name: 'Smart Notes Reminders',
  description: 'High priority reminders for patient notes',
  importance: 5, // IMPORTANCE_HIGH - shows as heads-up notification
  visibility: 1, // VISIBILITY_PUBLIC
  sound: undefined, // Use system default sound
  vibration: true,
  lights: true,
  lightColor: '#FF0000'
});
```

#### 5. Robust Notification Scheduling

**Platform Detection:**
```typescript
if (this.isWeb) {
  await this.scheduleWebNotification(id, bed, text, scheduleTime);
} else {
  await this.scheduleNativeNotification(id, bed, text, scheduleTime);
}
```

**For PWA (Web Notifications):**
```typescript
private async scheduleWebNotification(
  id: number,
  bed: string,
  text: string,
  scheduleTime: Date
) {
  const delay = scheduleTime.getTime() - Date.now();
  
  // Store notification data in localStorage for persistence
  const timeoutKey = `notification_timeout_${id}`;
  localStorage.setItem(timeoutKey, JSON.stringify({
    id, bed, text, scheduleTime: scheduleTime.toISOString()
  }));
  
  // Schedule using setTimeout
  setTimeout(() => {
    const notes = this._notes();
    const noteExists = notes.some((n: ShiftNote) => n.id === id);
    
    if (noteExists && Notification.permission === 'granted') {
      new Notification(`IC Actie: ${bed}`, {
        body: text,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `note-${id}`,
        requireInteraction: false
      });
    }
    
    localStorage.removeItem(timeoutKey);
  }, delay);
}
```

**For Native Mobile (Capacitor):**
```typescript
private async scheduleNativeNotification(
  id: number,
  bed: string,
  text: string,
  scheduleTime: Date
) {
  const notification: LocalNotificationSchema = {
    title: `IC Actie: ${bed}`,
    body: text,
    id: id,
    schedule: { at: scheduleTime },
    sound: undefined, // System default
    channelId: this.isAndroid ? 'smart_notes_high_priority' : undefined
  };

  await LocalNotifications.schedule({
    notifications: [notification]
  });
}
```

## AndroidManifest.xml Permissions

The following permissions have been added to support local notifications:

```xml
<!-- Local Notifications: Android 13+ (API 33+) requires POST_NOTIFICATIONS -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Local Notifications: Required for exact alarm scheduling -->
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

<!-- Local Notifications: Fallback for older Android versions -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## Testing Instructions

### On Web/PWA

1. **Run Development Server**
   ```bash
   npm start
   # or
   ng serve
   ```

2. **Test in Browser**
   - Open browser to `http://localhost:4200`
   - Browser will prompt for notification permissions - **Accept**
   - Check console for: "✓ Web notification permissions granted"

3. **Test Notification Scheduling**
   - Open the Shift Log page
   - Add a new note with a reminder time 1-2 minutes in the future
   - Keep the browser tab open (or minimize)
   - Wait for the scheduled time
   - Browser notification should appear

4. **PWA Installation (Optional)**
   - Chrome/Edge: Click install icon in address bar
   - Safari: Share → Add to Home Screen
   - Firefox: Install from menu
   - Test notifications work from installed PWA

**PWA Limitations:**
- Notifications require the browser tab to remain open (may run in background)
- setTimeout-based scheduling (not as persistent as native)
- Service Workers could be used for more persistent scheduling (future enhancement)
- Browser must support Web Notifications API

### On Android

1. **Build and Deploy**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. **Test Permission Request**
   - Launch the app
   - Check logcat for: "✓ Notification permissions granted"
   - If denied, go to App Settings → Notifications → Enable

3. **Test Exact Alarm Permission (Android 13+)**
   - Go to Settings → Apps → Your App → Alarms & reminders
   - Enable "Alarms & reminders" if not already enabled

4. **Test Notification Scheduling**
   - Open the Shift Log page
   - Add a new note with a reminder time 1-2 minutes in the future
   - Close the app completely (swipe away from recent apps)
   - Wait for the scheduled time
   - Notification should appear even with app closed

5. **Test Background Notifications**
   - Lock the phone
   - Notification should still appear at the scheduled time

### On iOS

1. **Build and Deploy**
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **Test Permission Request**
   - Launch the app
   - Accept notification permissions when prompted
   - If denied, go to Settings → Your App → Notifications → Enable

3. **Test Notification Scheduling**
   - Add a note with a reminder
   - Close the app (swipe up from home indicator)
   - Wait for notification
   - Should appear even with app closed

## Debugging

### Enable Console Logging
Check the following log messages in the console:

**For PWA/Web:**
- `Web Notification permission: granted` - Browser permissions granted
- `✓ Web notification permissions granted` - Web notifications ready
- `Scheduling notification: {platform: 'web', ...}` - Notification being scheduled
- `Web notification scheduled with XXXms delay` - Scheduling confirmed
- `✓ Web notification displayed for note XXX` - Notification shown

**For Native Mobile:**
- `✓ Notification permissions granted` - Permissions successful
- `✓ High priority notification channel created` - Android channel ready (Android only)
- `Scheduling notification: {platform: 'android'/'ios', ...}` - Notification being scheduled
- `✓ Notification scheduled successfully` - Scheduling complete

### Common Issues

#### PWA/Web Notifications
**Notifications not appearing:**
1. Check browser notification permissions in browser settings
2. Ensure browser tab is open or running in background
3. Check browser supports Web Notifications API
4. Verify time is in the future
5. Check browser console for errors

**Browser compatibility:**
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support  
- ⚠️ Safari: Limited support (iOS requires Add to Home Screen)
- ❌ Some browsers may not support Web Notifications

#### Notifications not appearing on Android
1. Check notification permissions in app settings
2. Check "Alarms & reminders" permission (Android 13+)
3. Verify notification channel is created (check logs)
4. Ensure time is in the future

#### Notifications not appearing on iOS
1. Check notification permissions in iOS Settings
2. Ensure app is not in Do Not Disturb mode
3. Check Focus settings
4. Verify time is in the future

#### No sound on iOS
- The implementation uses system default sound
- Custom sound files like 'beep.wav' are removed to prevent crashes

## State Management

The service maintains the existing signal-based state management:
- `_notes` signal stores all notes
- `notes` readonly signal exposes the data
- All CRUD operations update the signal and save to localStorage
- reminderTime dates are properly serialized/deserialized

## Best Practices

1. **Always schedule notifications in the future**
   - The service automatically adjusts past dates
   - Add validation in the UI to prevent past dates

2. **Use descriptive notification content**
   - Title includes bed number: `IC Actie: Bed 4`
   - Body contains the note content

3. **Test on real devices**
   - Emulators may not accurately simulate background notifications
   - Test with app completely closed
   - Test with phone locked

4. **Monitor permissions**
   - Users can revoke permissions at any time
   - App should handle denied permissions gracefully

## Migration Notes

### Changes from Previous Implementation
- ✅ Removed `sound: 'beep.wav'` (replaced with system default)
- ✅ Added platform detection
- ✅ Added notification channel creation for Android
- ✅ Added date validation
- ✅ Enhanced error handling and logging
- ✅ Added Android 13+ permission support

### No Breaking Changes
- All existing methods (`addNote`, `updateNote`, `deleteNote`) work the same
- Signal-based state management unchanged
- Component integration unchanged
