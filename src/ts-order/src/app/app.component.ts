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
  overview: FormGroup;

  // @ts-ignore
  contactFormGroup: FormGroup;

  isEditable = true;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.overview = this.formBuilder.group({

    });
    this.contactFormGroup = this.formBuilder.group({
      gender: ['Herr', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      company: ['', Validators.compose([])],
      street: ['', Validators.compose([Validators.required, Validators.min(4), Validators.minLength(12)])],
      zip: ['', Validators.required],
      address: ['', Validators.required],
      region: ['', Validators.required],
    });
  }

  submit(): void {
    let a = this.contactFormGroup.controls['firstname'];
    console.log(a.value);
  }
}
