# Local Notifications Implementation Guide

## Overview
This document describes the robust local notifications implementation for the Smart Notes app using `@capacitor/local-notifications` with support for Android 13+ and iOS.

## Key Features

### ✅ Android 13+ Support
- **POST_NOTIFICATIONS** permission handling
- **SCHEDULE_EXACT_ALARM** permission for precise timing
- High Priority notification channel (Importance 5)
- Proper permissions declared in AndroidManifest.xml

### ✅ Cross-Platform Compatibility
- Works on Android (all versions)
- Works on iOS
- Handles platform-specific requirements automatically

### ✅ Robust Implementation
- System default sound (no custom audio files that could crash iOS)
- Date validation to ensure notifications are scheduled in the future
- Automatic adjustment for past dates
- Comprehensive error handling and logging
- Works when app is closed, backgrounded, or phone is locked

## Technical Implementation

### ShiftLogService Changes

#### 1. Platform Detection
```typescript
private isAndroid = Capacitor.getPlatform() === 'android';
private isIOS = Capacitor.getPlatform() === 'ios';
```

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
- Requests notification permissions on startup
- Checks for exact alarm permission on Android
- Logs permission status for debugging

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
```typescript
private async scheduleNotification(
  id: number,
  bed: string,
  text: string,
  reminderTime: Date
) {
  // Validate date is valid and in the future
  if (!(reminderTime instanceof Date) || isNaN(reminderTime.getTime())) {
    console.error('Invalid reminder time provided:', reminderTime);
    return;
  }

  const now = new Date();
  if (reminderTime <= now) {
    console.warn('Reminder time is in the past, adjusting to 1 minute from now');
    reminderTime = new Date(now.getTime() + 60000);
  }

  // Schedule with system default sound
  const notification: LocalNotificationSchema = {
    title: `IC Actie: ${bed}`,
    body: text,
    id: id,
    schedule: { at: reminderTime },
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

- `✓ Notification permissions granted` - Permissions successful
- `✓ High priority notification channel created` - Android channel ready
- `Scheduling notification: {...}` - Notification being scheduled
- `✓ Notification scheduled successfully` - Scheduling complete

### Common Issues

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
