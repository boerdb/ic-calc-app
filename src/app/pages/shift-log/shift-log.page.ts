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

// Jouw eigen bestanden
import { ShiftLogService } from '../../services/shift-log.service';
import { ShiftNote } from '../../models/shift-note.model';
import { AddShiftNoteComponent } from '../../components/add-shift-note/add-shift-note.component';

// Let op: check even of dit pad klopt. Meestal is het .service achter de naam.
// Als jouw bestand echt 'patient.ts' heet, haal '.service' dan weg.
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
  // Services injecteren
  public logService = inject(ShiftLogService);
  private modalCtrl = inject(ModalController);
  public patientService = inject(PatientService);

  constructor() {
    addIcons({ trash, add, alertCircle, informationCircle, documentTextOutline });
  }

  // Functie: Open het invulscherm (Modal)
  async openAddModal() {
    // --- HIER ZAT DE FOUT EN DIT IS DE OPLOSSING ---

    // 1. Pak de hele patiënt (niet alleen de naam)
    const current = this.patientService.current;
    let completeTitle = '';

    if (current) {
      // Stap A: Hebben we een bednummer?
      if (current.bedId) {
        completeTitle += `Bed ${current.bedId}`;
      }

      // Stap B: Hebben we een naam?
      if (current.naam) {
        // Als we al een bed hebben, zetten we er een streepje tussen
        if (completeTitle.length > 0) {
          completeTitle += ' - ';
        }
        completeTitle += current.naam;
      }
    }

    // -----------------------------------------------

    const modal = await this.modalCtrl.create({
      component: AddShiftNoteComponent,
      // 2. Nu sturen we de complete titel ("Bed 4 - Jansen") door
      componentProps: {
        prefilledBed: completeTitle
      }
    });

    await modal.present();

    // Wacht tot de modal sluit en vang de data op
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      const reminderDate = data.reminderTime ? new Date(data.reminderTime) : undefined;

      // Opslaan!
      this.logService.addNote(data.bedNumber, data.content, reminderDate);
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
