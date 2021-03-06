import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.less']
})
export class DropZoneComponent {

  @Input()
  dropPromptText = 'Dateien hier hinzufügen';
  @Input()
  dropBackgroundDefault = '#ffffff';
  @Input()
  dropBackgroundActive = '#388e3c';
  @Input()
  enableSelectionButton = true;
  @Output()
  fileAdded = new EventEmitter<File[]>();

  dropBackground = this.dropBackgroundDefault;

  constructor() {
  }

  onDragEnter(): void {
    this.dropBackground = this.dropBackgroundActive;
  }

  onDragLeave(): void {
    this.dropBackground = this.dropBackgroundDefault;
  }

  onDragOver($event: DragEvent): void {
    $event.preventDefault();
  }

  onDrop($event: DragEvent): void {
    $event.preventDefault();
    this.dropBackground = this.dropBackgroundDefault;
    if ($event.dataTransfer !== null) {
      this.onFileAdded(Array.from($event.dataTransfer.files));
    }
  }

  onFileSelected($event: Event): void {
    $event.preventDefault();
    // @ts-ignore
    this.onFileAdded(Array.from(($event.target as HTMLInputElement).files));
  }

  onFileAdded(files: File[]): void {
    if (files.length === 0) { // happens sometimes
      return;
    }
    console.log('emitting file event:', files);
    this.fileAdded.emit(files);
  }
}
