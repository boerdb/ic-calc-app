import { Injectable, signal } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ShiftNote } from '../models/shift-note.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftLogService {
  // De signal die de lijst met notities bevat
  private _notes = signal<ShiftNote[]>([]);
  readonly notes = this._notes.asReadonly();

  constructor() {
    this.requestPermissions();
  }

  async requestPermissions() {
    // Vraag toestemming voor notificaties (werkt vooral op mobiel)
    try {
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.log('Geen notificatie support (bijv. in browser)', e);
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
    this._notes.update(notes => [...notes, newNote]);

    // Plan notificatie in (als er een tijd is)
    if (reminderTime) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: `IC Actie: ${bed}`,
              body: text,
              id: uniqueId,
              schedule: { at: reminderTime },
              sound: 'beep.wav'
            }
          ]
        });
      } catch (e) {
        console.log('Kon notificatie niet plannen', e);
      }
    }
  }

  // --- UPDATE ---
  updateNote(updatedNote: ShiftNote) {
    this._notes.update(notes =>
      notes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  }

  // --- DELETE ---
  async deleteNote(id: number) {
    this._notes.update(notes => notes.filter(n => n.id !== id));

    try {
      await LocalNotifications.cancel({ notifications: [{ id: id }] });
    } catch (e) {
      // negeer fouten als notificatie al weg was
    }
  }
}
