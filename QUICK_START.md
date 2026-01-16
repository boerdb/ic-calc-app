# Quick Start Guide: Testing Your New Notifications

## What Was Changed

✅ **ShiftLogService completely rewritten** with robust notification handling  
✅ **PWA/Web support added** using Web Notifications API  
✅ **Native mobile support** for Android and iOS using Capacitor  
✅ **AndroidManifest.xml updated** with all required permissions  
✅ **System default sound** replaces custom 'beep.wav'  
✅ **Works across all platforms**: Web, Android, iOS

## Platform Support

### 🌐 Progressive Web App (PWA) / Web Browser
- **Platform**: Chrome, Edge, Firefox, Safari
- **Notification API**: Web Notifications API
- **Limitations**: Requires browser tab open or running in background
- **Best For**: Desktop usage, quick testing

### 📱 Native Mobile
- **Platform**: Android, iOS
- **Notification API**: Capacitor LocalNotifications
- **Advantages**: Works when app is closed/killed, persistent notifications
- **Best For**: Production mobile deployments

## Immediate Testing Steps

### For PWA/Web (Fastest - Start Here!):

```bash
# 1. Start development server
npm start
# or
ng serve

# 2. Open browser to http://localhost:4200
# 3. Accept notification permissions when prompted
# 4. Add a note with a reminder 1-2 minutes in the future
# 5. Keep browser tab open (can minimize)
# 6. Wait for notification - it should appear!
```

**Note**: Web notifications work best in Chrome, Edge, or Firefox. Safari has limited support.

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

**For PWA/Web:**
- Console logs: "Web Notification permission: granted"
- Console logs: "✓ Web notification permissions granted"
- Console logs: "Web notification scheduled with XXXms delay"
- Console logs: "✓ Web notification displayed for note XXX"
- Browser notification appears with title "IC Actie: [bed]"
- Notification shows even when browser is minimized

**For Native Mobile:**
- Console logs: "✓ Notification permissions granted"
- Console logs: "✓ High priority notification channel created" (Android)
- Console logs: "✓ Notification scheduled successfully"
- Notification appears even when app is completely closed
- System default sound plays (not custom beep)
- Notification shows as heads-up on Android (High Priority)

### ⚠️ If Notifications Don't Appear:

#### On PWA/Web:
1. Check browser notification permissions
   - Chrome/Edge: Settings → Privacy → Site Settings → Notifications
   - Firefox: Preferences → Privacy → Permissions → Notifications
   - Safari: Preferences → Websites → Notifications
2. Ensure browser tab is open or running in background
3. Check browser console for errors
4. Try a different browser (Chrome/Edge recommended)
5. Ensure time is in the future (app auto-adjusts past dates)

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

### Platform Detection
```typescript
private platform = Capacitor.getPlatform();
private isAndroid = this.platform === 'android';
private isIOS = this.platform === 'ios';
private isWeb = this.platform === 'web';
```

### PWA/Web Notifications
```typescript
// Request permissions
const permission = await Notification.requestPermission();

// Schedule with setTimeout
setTimeout(() => {
  new Notification(`IC Actie: ${bed}`, {
    body: text,
    icon: '/favicon.ico',
    tag: `note-${id}`
  });
}, delay);
```

**Limitations:**
- Requires browser tab to be open (can be backgrounded)
- Uses setTimeout (cleared if page closes/reloads)
- Service Worker integration could improve persistence (future enhancement)

### Native Mobile Notifications (Android/iOS)
```typescript
// High Priority channel for heads-up notifications (Android)
await LocalNotifications.createChannel({
  id: 'smart_notes_high_priority',
  name: 'Smart Notes Reminders',
  importance: 5, // IMPORTANCE_HIGH
  sound: undefined // System default
});

// Schedule notification
await LocalNotifications.schedule({
  notifications: [{
    title: `IC Actie: ${bed}`,
    body: text,
    schedule: { at: scheduleTime },
    channelId: 'smart_notes_high_priority' // Android only
  }]
});
```

**Advantages:**
- Works when app is completely closed
- Persistent across device reboots (Android)
- Native OS notification system

### Android 13+ Permissions (Added to AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

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
A: Yes! The app now detects when running as a PWA/web app and uses the Web Notifications API instead of Capacitor. This makes it perfect for both mobile apps and web deployments.

**Q: What's the difference between web and native notifications?**  
A: 
- **Web**: Requires browser tab open, uses setTimeout, works on desktop/laptop browsers
- **Native**: Works when app is closed, persistent, true mobile push notifications

**Q: Do I need to rebuild the Android/iOS native projects?**  
A: Only if deploying to native mobile. For PWA/web, just run `npm start` and test in browser.

**Q: What if users deny permissions?**  
A: The app handles this gracefully. Users can enable permissions later in browser/device Settings.

**Q: Can I test notifications without building native apps?**  
A: Yes! Just run `npm start` and test in your browser (Chrome/Edge recommended). It's the fastest way to verify the implementation.

**Q: Will web notifications persist across page reloads?**  
A: Currently no - setTimeout is cleared on reload. For production PWA, consider implementing Service Worker-based scheduling for better persistence.

**Q: Which platform should I use for production?**  
A:
- **Native apps** (Android/iOS): Best user experience, persistent notifications
- **PWA**: Great for quick deployment, works on desktop, lower friction (no app store)
- **Both**: Deploy as both native apps and PWA for maximum reach!

## For More Details

See `NOTIFICATION_IMPLEMENTATION.md` for:
- Complete technical documentation
- Advanced debugging techniques
- Platform-specific considerations
- Best practices

---

**Need Help?** Check the console logs first - they're very detailed and will show exactly what's happening with permissions and scheduling.
