import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgQueryRxInsertions } from './ng-query-rx-insertions';

describe('NgQueryRxInsertions', () => {
  let component: NgQueryRxInsertions;
  let fixture: ComponentFixture<NgQueryRxInsertions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgQueryRxInsertions],
    }).compileComponents();

    fixture = TestBed.createComponent(NgQueryRxInsertions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
