import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTextureComponent } from './import-texture.component';

describe('ImportTextureComponent', () => {
  let component: ImportTextureComponent;
  let fixture: ComponentFixture<ImportTextureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportTextureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportTextureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
