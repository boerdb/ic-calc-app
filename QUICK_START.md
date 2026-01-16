# Quick Start Guide: Testing Your New Notifications

## What Was Changed

✅ **ShiftLogService completely rewritten** with robust notification handling  
✅ **AndroidManifest.xml updated** with all required permissions  
✅ **System default sound** replaces custom 'beep.wav'  
✅ **Works when app is closed/killed** on both Android and iOS

## Immediate Testing Steps

### For Android:

```bash
# 1. Build and sync
npm run build
npx cap sync android

# 2. Open in Android Studio
npx cap open android

# 3. Run on device (not emulator for best results)
# 4. Accept notification permissions when prompted
# 5. Add a note with a reminder 2 minutes in the future
# 6. CLOSE the app completely (swipe away from recent apps)
# 7. Wait for notification - it should appear even with app closed!
```

### For iOS:

```bash
# 1. Build and sync
npm run build
npx cap sync ios

# 2. Open in Xcode
npx cap open ios

# 3. Run on device
# 4. Accept notification permissions when prompted
# 5. Add a note with a reminder 2 minutes in the future
# 6. Close the app (swipe up from home)
# 7. Wait for notification
```

## What to Look For

### ✅ Success Indicators:
- Console logs: "✓ Notification permissions granted"
- Console logs: "✓ High priority notification channel created" (Android)
- Console logs: "✓ Notification scheduled successfully"
- Notification appears even when app is completely closed
- System default sound plays (not custom beep)
- Notification shows as heads-up on Android (High Priority)

### ⚠️ If Notifications Don't Appear:

#### On Android:
1. Go to Settings → Apps → Your App → Notifications → Enable
2. Go to Settings → Apps → Your App → Alarms & reminders → Enable (Android 13+)
3. Check logcat/console for permission errors
4. Ensure time is in the future (app auto-adjusts past dates)

#### On iOS:
1. Go to Settings → Your App → Notifications → Enable
2. Check Focus/Do Not Disturb is off
3. Ensure time is in the future
4. Test on real device (not simulator)

## Key Implementation Details

### Android 13+ Permissions (Added to AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

### High Priority Channel (Android):
- **ID**: `smart_notes_high_priority`
- **Importance**: 5 (IMPORTANCE_HIGH)
- **Visibility**: Public
- **Features**: Vibration, Lights, System sound

### Date Validation:
- Ensures Date objects are valid
- Auto-adjusts past dates to 1 minute in the future
- No more silent failures from invalid dates

### Sound Handling:
- ❌ Removed: `sound: 'beep.wav'` (causes iOS crashes)
- ✅ Using: `sound: undefined` (system default)

## Console Logs to Monitor

When you add a note with a reminder, you should see:

```
Notification permissions result: {display: "granted"}
✓ Notification permissions granted
Android notification permissions check: {...}
✓ High priority notification channel created
Scheduling notification: {id: 1234, bed: "Bed 4", time: "2026-01-16T17:00:00.000Z", timeFromNow: "120s"}
✓ Notification scheduled successfully
```

## Debugging Tips

### Enable Chrome DevTools for Android:
1. Connect device via USB
2. Open Chrome → `chrome://inspect`
3. Find your app and click "inspect"
4. Check Console tab for logs

### Enable Safari Web Inspector for iOS:
1. On device: Settings → Safari → Advanced → Web Inspector → On
2. Connect device via USB
3. On Mac: Safari → Develop → [Your Device] → [Your App]
4. Check Console for logs

## No Changes Needed in Your Components

The existing code in `shift-log.page.ts` and `add-shift-note.component.ts` works exactly the same - no changes needed! The notification improvements are all internal to the service.

## Common Questions

**Q: Will this work on web/browser?**  
A: Local notifications are mobile-only. On web, the code runs but notifications won't appear (this is a Capacitor limitation).

**Q: Do I need to rebuild the Android/iOS native projects?**  
A: Yes, run `npx cap sync android` and `npx cap sync ios` to update the native projects with the new AndroidManifest.xml permissions.

**Q: What if users deny permissions?**  
A: The app handles this gracefully. Users can enable permissions later in device Settings.

**Q: Can I customize the notification sound later?**  
A: Yes, but you'll need to add the sound file to the native iOS/Android projects. For now, system default is most reliable.

## For More Details

See `NOTIFICATION_IMPLEMENTATION.md` for:
- Complete technical documentation
- Advanced debugging techniques
- Platform-specific considerations
- Best practices

---

**Need Help?** Check the console logs first - they're very detailed and will show exactly what's happening with permissions and scheduling.
