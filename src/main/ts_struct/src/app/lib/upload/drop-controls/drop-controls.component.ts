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
  @Output()
  deleteAll = new EventEmitter<MouseEvent>();
  @Output()
  submitAll = new EventEmitter<MouseEvent>();

}
