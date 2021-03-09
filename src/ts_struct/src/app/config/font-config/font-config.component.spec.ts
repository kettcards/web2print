import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontConfigComponent } from './font-config.component';

describe('FontConfigComponent', () => {
  let component: FontConfigComponent;
  let fixture: ComponentFixture<FontConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FontConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FontConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
