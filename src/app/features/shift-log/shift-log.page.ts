import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonList, IonItemSliding, IonItem, IonIcon, IonLabel, IonCheckbox,
  IonItemOptions, IonItemOption, IonFab, IonFabButton,
  IonCard, IonCardContent, IonButton,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, add, alertCircle, informationCircle, documentTextOutline } from 'ionicons/icons';

// Services en Models
import { ShiftLogService } from '@core/services/shift-log.service';
import { ShiftNote } from '../../models/shift-note.model';
import { AddShiftNoteComponent } from '../add-shift-note/add-shift-note.component';
import { PatientService } from '@core/services/patient';

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
    IonItemOptions, IonItemOption, IonFab, IonFabButton

  ]
})
export class ShiftLogPage {
  public logService = inject(ShiftLogService);
  private modalCtrl = inject(ModalController);
  public patientService = inject(PatientService);

  constructor() {
    addIcons({ trash, add, alertCircle, informationCircle, documentTextOutline });
  }

  async openAddModal() {
    const current = this.patientService.current;
    let completeTitle = '';

    if (current) {
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
      const reminderDate = data.reminderTime
        ? new Date(data.reminderTime)
        : undefined;

      // Opslaan in service (zonder notificaties)
      this.logService.addNote(
        data.bedNumber,
        data.content,
        reminderDate
      );
    }
  }

  deleteNote(id: number) {
    this.logService.deleteNote(id);
  }

  toggleStatus(note: ShiftNote) {
    const updatedNote = { ...note, isCompleted: !note.isCompleted };
    this.logService.updateNote(updatedNote);
  }
}
