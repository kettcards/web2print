import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportMotiveDialogComponent } from './import-motive-dialog.component';

describe('ImportMotiveDialogComponent', () => {
  let component: ImportMotiveDialogComponent;
  let fixture: ComponentFixture<ImportMotiveDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportMotiveDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportMotiveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
