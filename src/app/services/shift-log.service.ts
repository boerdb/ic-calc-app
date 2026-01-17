import { Injectable, signal, inject } from '@angular/core';
import { ShiftNote } from '../models/shift-note.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ShiftLogService {
  private notificationService = inject(NotificationService);
  
  // 1. We laden direct bij het opstarten de data uit het geheugen
  private _notes = signal<ShiftNote[]>(this.loadFromStorage());
  readonly notes = this._notes.asReadonly();

  constructor() {
    // Permission will be requested by user action through the notification banner UI
  }

  async requestNotificationPermission(): Promise<boolean> {
    return await this.notificationService.requestPermission();
  }

  getNotificationPermissionStatus(): NotificationPermission {
    return this.notificationService.getPermissionStatus();
  }

  isNotificationSupported(): boolean {
    return this.notificationService.isSupported();
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
      try {
        this.notificationService.scheduleNotification(
          uniqueId,
          `IC Actie: ${bed}`,
          text,
          reminderTime
        );
      } catch (e) {
        console.log('Kon notificatie niet plannen', e);
      }
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
      this.notificationService.cancelScheduledNotification(id);
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
