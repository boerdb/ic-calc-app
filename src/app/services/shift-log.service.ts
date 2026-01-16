import { Injectable, signal } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { ShiftNote } from '../models/shift-note.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftLogService {
  // 1. We laden direct bij het opstarten de data uit het geheugen
  private _notes = signal<ShiftNote[]>(this.loadFromStorage());
  readonly notes = this._notes.asReadonly();

  private platform = Capacitor.getPlatform();
  private isAndroid = this.platform === 'android';
  private isIOS = this.platform === 'ios';
  private channelCreated = false;

  constructor() {
    this.initializeNotifications();
  }

  /**
   * Initialize notifications: request permissions and create Android channel
   */
  private async initializeNotifications() {
    try {
      // Step 1: Request all necessary permissions
      await this.requestPermissions();

      // Step 2: Create Android notification channel (High Priority)
      if (this.isAndroid) {
        await this.createNotificationChannel();
      }
    } catch (e) {
      console.error('Failed to initialize notifications:', e);
    }
  }

  /**
   * Request all necessary permissions for notifications
   * - Android 13+: POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM
   * - iOS: Standard notification permissions
   */
  async requestPermissions() {
    try {
      // Request basic notification permissions
      const permResult = await LocalNotifications.requestPermissions();
      console.log('Notification permissions result:', permResult);

      if (permResult.display === 'granted') {
        console.log('✓ Notification permissions granted');
      } else {
        console.warn('⚠ Notification permissions denied or not granted');
      }

      // Android 13+ specific: Check for exact alarm permission
      if (this.isAndroid) {
        await this.checkAndroidExactAlarmPermission();
      }
    } catch (e) {
      console.error('Error requesting permissions:', e);
    }
  }

  /**
   * Android 13+ requires SCHEDULE_EXACT_ALARM permission
   * This logs the status (actual permission request happens via manifest)
   */
  private async checkAndroidExactAlarmPermission() {
    try {
      // Check if we can schedule exact alarms
      const result = await LocalNotifications.checkPermissions();
      console.log('Android notification permissions check:', result);
    } catch (e) {
      console.warn('Could not check exact alarm permission:', e);
    }
  }

  /**
   * Create High Priority Android notification channel
   * Importance 5 = IMPORTANCE_HIGH (shows as heads-up notification)
   */
  private async createNotificationChannel() {
    if (this.channelCreated) {
      return; // Channel already created
    }

    try {
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

      this.channelCreated = true;
      console.log('✓ High priority notification channel created');
    } catch (e) {
      console.error('Failed to create notification channel:', e);
    }
  }

  // --- CREATE ---
  async addNote(bed: string, text: string, reminderTime?: Date) {
    const uniqueId = Date.now();

    const newNote: ShiftNote = {
      id: uniqueId,
      bedNumber: bed,
      content: text,
      priority: 'low',
      isCompleted: false,
      reminderTime: reminderTime
    };

    // Update de lijst
    this._notes.update(notes => {
      const updatedList = [...notes, newNote];
      this.saveToStorage(updatedList); // <--- OPSLAAN
      return updatedList;
    });

    // Plan notificatie in
    if (reminderTime) {
      await this.scheduleNotification(uniqueId, bed, text, reminderTime);
    }
  }

  /**
   * Schedule a local notification with robust error handling
   * Ensures the notification works on both Android and iOS when app is closed
   */
  private async scheduleNotification(
    id: number,
    bed: string,
    text: string,
    reminderTime: Date
  ) {
    try {
      // Validate that reminderTime is a valid Date in the future
      if (!(reminderTime instanceof Date) || isNaN(reminderTime.getTime())) {
        console.error('Invalid reminder time provided:', reminderTime);
        return;
      }

      const now = new Date();
      let scheduleTime = reminderTime;
      
      if (reminderTime <= now) {
        console.warn('Reminder time is in the past, adjusting to 1 minute from now');
        scheduleTime = new Date(now.getTime() + 60000); // 1 minute from now
      }

      // Build notification object
      const notification: LocalNotificationSchema = {
        title: `IC Actie: ${bed}`,
        body: text,
        id: id,
        schedule: { at: scheduleTime },
        sound: undefined, // Use system default sound (no custom 'beep.wav')
        largeBody: text,
        summaryText: 'Smart Notes Reminder'
      };

      // Add Android-specific channel
      if (this.isAndroid) {
        notification.channelId = 'smart_notes_high_priority';
      }

      console.log('Scheduling notification:', {
        id,
        bed,
        time: scheduleTime.toISOString(),
        timeFromNow: Math.round((scheduleTime.getTime() - now.getTime()) / 1000) + 's'
      });

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log('✓ Notification scheduled successfully');
    } catch (e) {
      console.error('Failed to schedule notification:', e);
    }
  }

  // --- UPDATE ---
  updateNote(updatedNote: ShiftNote) {
    this._notes.update(notes => {
      const updatedList = notes.map(note => note.id === updatedNote.id ? updatedNote : note);
      this.saveToStorage(updatedList); // <--- OPSLAAN
      return updatedList;
    });
  }

  // --- DELETE ---
  async deleteNote(id: number) {
    this._notes.update(notes => {
      const updatedList = notes.filter(n => n.id !== id);
      this.saveToStorage(updatedList); // <--- OPSLAAN
      return updatedList;
    });

    try {
      await LocalNotifications.cancel({ notifications: [{ id: id }] });
    } catch (e) {
      // negeer foutjes
    }
  }

  // ==========================================================
  //  OPSLAG LOGICA (LocalStorage)
  // ==========================================================

  private saveToStorage(notes: ShiftNote[]) {
    // We zetten de array om naar tekst (JSON) en slaan het op
    localStorage.setItem('smart_notes_data', JSON.stringify(notes));
  }

  private loadFromStorage(): ShiftNote[] {
    const data = localStorage.getItem('smart_notes_data');
    if (data) {
      // We toveren de tekst weer om naar een array
      const parsedNotes = JSON.parse(data);

      // Klein trucje: Datums komen als tekst uit opslag ('2023-11-20...'),
      // dus we maken er weer echte Date objecten van voor de zekerheid.
      return parsedNotes.map((n: any) => ({
        ...n,
        reminderTime: n.reminderTime ? new Date(n.reminderTime) : undefined
      }));
    }
    return []; // Als er niks is, begin met lege lijst
  }
}
