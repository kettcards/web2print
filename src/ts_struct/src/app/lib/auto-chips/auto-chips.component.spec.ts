import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoChipsComponent } from './auto-chips.component';

describe('AutoChipsComponent', () => {
  let component: AutoChipsComponent;
  let fixture: ComponentFixture<AutoChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoChipsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
