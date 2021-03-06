import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-error-load',
  templateUrl: './error-load.component.html',
  styleUrls: ['./error-load.component.less']
})
export class ErrorLoadComponent {

  @Input()
  errorMessage: string | null = null;
  @Output()
  onRetry: EventEmitter<any> = new EventEmitter();

}
