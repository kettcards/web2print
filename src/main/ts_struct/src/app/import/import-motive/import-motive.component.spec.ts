import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportMotiveComponent } from './import-motive.component';

describe('ImportMotiveComponent', () => {
  let component: ImportMotiveComponent;
  let fixture: ComponentFixture<ImportMotiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportMotiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportMotiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
