import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { addIcons } from 'ionicons';
// Alle iconen die we nodig hebben
import {
  checkmarkCircle,
  alertCircle,
  stopCircle,
  warning,
  chevronBack,
  chevronForward,
  arrowForward
} from 'ionicons/icons';

register();

@Component({
  selector: 'app-pv-wizard',
  templateUrl: './pv-wizard.component.html',
  styleUrls: ['./pv-wizard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PvWizardComponent {

  @ViewChild('swiper') swiperRef: ElementRef | undefined;

  // Variabelen om te weten of we pijlen moeten tonen
  isBeginning: boolean = true;
  isEnd: boolean = false;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ checkmarkCircle, alertCircle, stopCircle, warning, chevronBack, chevronForward, arrowForward });
  }

  // Checkt bij elke swipe waar we zijn
  onSlideChange(event: any) {
    const swiper = this.swiperRef?.nativeElement.swiper;
    if (swiper) {
      this.isBeginning = swiper.isBeginning;
      this.isEnd = swiper.isEnd;
    }
  }

  // Handmatige navigatie voor de ghost-arrows
  slideNext() {
    this.swiperRef?.nativeElement.swiper.slideNext();
  }

  slidePrev() {
    this.swiperRef?.nativeElement.swiper.slidePrev();
  }

  sluit() {
    this.modalCtrl.dismiss();
  }
}
