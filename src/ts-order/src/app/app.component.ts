import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ts-order';

  firstFieldControl = new FormControl();

  fieldControl = new FormControl();

  // @ts-ignore
  contactFormGroup: FormGroup;

  // @ts-ignore
  secondFormGroup: FormGroup;
  isEditable = true;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.contactFormGroup = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      company: new FormControl(),
      street: ['', Validators.required],
      zip: ['', Validators.required],
      address: ['', Validators.required],
      region: ['', Validators.required],
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: new FormControl()
    });
  }
}
