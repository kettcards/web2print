import {Component, ElementRef, Input, Output, ViewChild} from '@angular/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-auto-chips',
  templateUrl: './auto-chips.component.html',
  styleUrls: ['./auto-chips.component.less']
})
export class AutoChipsComponent {

  @Input()
  visible = true;
  @Input()
  removable = true;
  @Input()
  maxAutocompleteOptions = 3;
  @Input()
  separatorKeysCodes: number[] = [ENTER, COMMA];
  @Input()
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'lulw', 'lll', 'Orange', 'Strawberry'];
  formControl = new FormControl();
  filteredFruits: Observable<string[]>;
  @Output()
  selectedChips: string[] = ['Lemon'];
  // @ts-ignore
  @ViewChild('fruitInput') input: ElementRef<HTMLInputElement>;
  // @ts-ignore
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor() {
    this.filteredFruits = this.formControl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
  }

  add(event: MatChipInputEvent): void {
    if ((event.value || '').trim()) {
      this.selectedChips.push(event.value.trim());
    }
    if (event.input) {
      event.input.value = '';
    }
    this.formControl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.selectedChips.indexOf(fruit);
    if (index >= 0) {
      this.selectedChips.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedChips.push(event.option.viewValue);
    this.input.nativeElement.value = '';
    this.formControl.setValue(null);
  }

  private _filter(value: string): string[] {
    if (value.length == null) {
      return [];
    }
    const filterValue = value.toLowerCase();
    let spliced =  this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0).splice(0, this.maxAutocompleteOptions);
    console.log('spliced', spliced);
    return spliced;
  }

}

export interface Fruit {
  name: string;
}
