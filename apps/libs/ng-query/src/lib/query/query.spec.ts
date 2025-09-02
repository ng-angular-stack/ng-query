import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Query } from './query';

describe('Query', () => {
  let component: Query;
  let fixture: ComponentFixture<Query>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Query],
    }).compileComponents();

    fixture = TestBed.createComponent(Query);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
