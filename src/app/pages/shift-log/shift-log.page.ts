import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonList, IonItemSliding, IonItem, IonIcon, IonLabel, IonCheckbox,
  IonItemOptions, IonItemOption, IonFab, IonFabButton, IonCard, IonCardContent, IonButton, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, add, alertCircle, informationCircle, documentTextOutline } from 'ionicons/icons';

// 1. Importeer de plugin
import { LocalNotifications } from '@capacitor/local-notifications';

// Services en Models
import { ShiftLogService } from '../../services/shift-log.service';
import { ShiftNote } from '../../models/shift-note.model';
import { AddShiftNoteComponent } from '../../components/add-shift-note/add-shift-note.component';
import { PatientService } from '../../services/patient';

@Component({
  selector: 'app-shift-log',
  templateUrl: './shift-log.page.html',
  styleUrls: ['./shift-log.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonList, IonItemSliding, IonItem, IonIcon, IonLabel, IonCheckbox,
    IonItemOptions, IonItemOption, IonFab, IonFabButton, IonCard, IonCardContent, IonButton
  ]
})
export class ShiftLogPage {
  public logService = inject(ShiftLogService);
  private modalCtrl = inject(ModalController);
  public patientService = inject(PatientService);

  // Cached notification status for template performance
  get isNotificationSupported(): boolean {
    return this.logService.isNotificationSupported();
  }

  get notificationPermissionStatus(): NotificationPermission {
    return this.logService.getNotificationPermissionStatus();
  }

  constructor() {
    addIcons({ trash, add, alertCircle, informationCircle, documentTextOutline });
    // Let op: requestPermissions is hier weggehaald voor iOS compatibiliteit
  }

  // Hulpfunctie om toestemming te checken/vragen
  async requestPermissions() {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    } catch (e) {
      console.log('Fout bij checken permissies:', e);
    }
  }

  async openAddModal() {
    // 1. VRAAG HIER PAS TOESTEMMING (Cruciaal voor Safari/iOS)
    // Omdat dit door een gebruiker-klik komt, staat Apple dit toe.
    await this.requestPermissions();

    // Titel genereren (kortere, modernere syntax)
    const current = this.patientService.current;
    let completeTitle = '';

    if (current) {
      // Dit voegt delen samen en zet er automatisch een streepje tussen als beide bestaan
      completeTitle = [
        current.bedId ? `Bed ${current.bedId}` : null,
        current.naam
      ].filter(Boolean).join(' - ');
    }

    const modal = await this.modalCtrl.create({
      component: AddShiftNoteComponent,
      componentProps: {
        prefilledBed: completeTitle
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      const reminderDate = data.reminderTime ? new Date(data.reminderTime) : undefined;

      // Opslaan in service
      this.logService.addNote(data.bedNumber, data.content, reminderDate);

      // Inplannen notificatie
      if (reminderDate) {
        this.scheduleNotification(data.bedNumber, data.content, reminderDate);
      }
    }
  }

  async scheduleNotification(title: string, body: string, date: Date) {
    // FIX VOOR ANDROID:
    // Android accepteert alleen 32-bit integers als ID.
    // new Date().getTime() is te groot en zorgt voor crashes of stille fouten.
    // De modulo (%) zorgt dat het getal klein genoeg blijft.
    const id = new Date().getTime() % 2147483647;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `Herinnering: ${title}`,
            body: body,
            id: id,
            schedule: { at: date },
            sound: undefined, // Gebruikt standaard systeemgeluid
            actionTypeId: '',
            extra: null
          }
        ]
      });
      console.log('Notificatie succesvol ingepland voor:', date);
    } catch (error) {
      console.error('Kon notificatie niet inplannen:', error);
    }
  }

  deleteNote(id: number) {
    this.logService.deleteNote(id);
  }

  toggleStatus(note: ShiftNote) {
    const updatedNote = { ...note, isCompleted: !note.isCompleted };
    this.logService.updateNote(updatedNote);
  }

  async requestNotificationPermission() {
    const granted = await this.logService.requestNotificationPermission();
    if (granted) {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  }
}
