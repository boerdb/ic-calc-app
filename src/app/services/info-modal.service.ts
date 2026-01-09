import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { InfoModalComponent } from '../info-modal.component';

/**
 * Service to handle creation of info modals throughout the app.
 * Reduces code duplication across multiple components.
 */
@Injectable({
  providedIn: 'root'
})
export class InfoModalService {
  private modalCtrl = inject(ModalController);

  /**
   * Opens an info modal with the specified title and HTML content
   * @param title The title to display in the modal header
   * @param htmlContent The HTML content to display in the modal body
   * @returns Promise that resolves when modal is presented
   */
  async openInfoModal(title: string, htmlContent: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: {
        title,
        content: htmlContent
      }
    });
    await modal.present();
  }
}
