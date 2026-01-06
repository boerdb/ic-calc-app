import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { Tab6Page } from './tab6.page';

describe('Tab6Page', () => {
  let component: Tab6Page;
  let fixture: ComponentFixture<Tab6Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab6Page],
      providers: [
        {
          provide: ModalController,
          useValue: { create: jasmine.createSpy('create') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab6Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
