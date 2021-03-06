import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropControlsComponent } from './drop-controls.component';

describe('DropControlsComponent', () => {
  let component: DropControlsComponent;
  let fixture: ComponentFixture<DropControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
