import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportMotiveDefaultComponent } from './import-motive-default.component';

describe('ImportMotiveDefaultComponent', () => {
  let component: ImportMotiveDefaultComponent;
  let fixture: ComponentFixture<ImportMotiveDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportMotiveDefaultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportMotiveDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
