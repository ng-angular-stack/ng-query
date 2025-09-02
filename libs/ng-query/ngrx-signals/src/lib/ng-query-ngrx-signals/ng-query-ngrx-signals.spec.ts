import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgQueryNgrxSignals } from './ng-query-ngrx-signals';

describe('NgQueryNgrxSignals', () => {
  let component: NgQueryNgrxSignals;
  let fixture: ComponentFixture<NgQueryNgrxSignals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgQueryNgrxSignals],
    }).compileComponents();

    fixture = TestBed.createComponent(NgQueryNgrxSignals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
