import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-drop-controls',
  templateUrl: './drop-controls.component.html',
  styleUrls: ['./drop-controls.component.less']
})
export class DropControlsComponent {

  @Input()
  list: any[] = [];
  @Input()
  showDeleteAll = true;
  @Input()
  showSubmitAll = true;
  @Input()
  showClearSuccessful = false;
  @Output()
  deleteAll = new EventEmitter<MouseEvent>();
  @Output()
  submitAll = new EventEmitter<MouseEvent>();
  @Output()
  clearSuccessful = new EventEmitter<MouseEvent>();

}
