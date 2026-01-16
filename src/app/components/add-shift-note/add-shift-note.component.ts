import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  IonHeader,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonDatetime,
  IonInput,
  IonTextarea
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-shift-note',
  templateUrl: './add-shift-note.component.html',
  styleUrls: ['./add-shift-note.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime
  ]
})
export class AddShiftNoteComponent implements OnInit {

  // Hier komt de tekst "Bed 04 - Mevr..." binnen vanuit de hoofdpagina
  @Input() prefilledBed: string = '';

  bedNumber = '';
  content = '';
  reminderTime: string | undefined;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Zodra het scherm opent: vul het bednummer automatisch in
    if (this.prefilledBed) {
      this.bedNumber = this.prefilledBed;
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    // Check of er iets is ingevuld
    if (!this.bedNumber || !this.content) {
      return;
    }

    // Stuur alle info (Bed + Tekst + Tijd) terug naar het logboek
    this.modalCtrl.dismiss({
      bedNumber: this.bedNumber,
      content: this.content,
      reminderTime: this.reminderTime
    }, 'confirm');
  }
}
