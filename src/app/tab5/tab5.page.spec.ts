import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { Tab5Page } from './tab5.page';

describe('Tab5Page', () => {
  let component: Tab5Page;
  let fixture: ComponentFixture<Tab5Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab5Page],
      providers: [
        {
          provide: ModalController,
          useValue: { create: jasmine.createSpy('create') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab5Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
