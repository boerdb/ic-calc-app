import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { PvWizardComponent } from './pv-wizard.component';

describe('PvWizardComponent', () => {
  let component: PvWizardComponent;
  let fixture: ComponentFixture<PvWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PvWizardComponent, IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: { dismiss: jasmine.createSpy('dismiss') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PvWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
