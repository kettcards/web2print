import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ts-order';

  // @ts-ignore
  overview: FormGroup;

  // @ts-ignore
  contactFormGroup: FormGroup;

  isEditable = true;

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
  }

  ngOnInit() {
    this.overview = this.formBuilder.group({});
    this.contactFormGroup = this.formBuilder.group({
      gender: ['Herr', Validators.required],
      firstname: ['', Validators.compose([Validators.required])],
      lastname: ['', Validators.compose([Validators.required])],
      street: ['', Validators.compose([Validators.required, Validators.min(4), Validators.minLength(12)])],
      zip: ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      address: ['', Validators.compose([Validators.required])],
      region: ['', Validators.compose([Validators.required])],
      mail: ['', Validators.compose([Validators.required, Validators.email])],
    });
  }

  submit(): void {
    let values: FormData[] = [];
    Object.keys(this.contactFormGroup.controls).forEach(k => {
      console.log('key');
      values.push({
        name: k,
        value: this.contactFormGroup.controls[k].value
      })
    });

    console.log(this.contactFormGroup.controls);
    this.http.post('localhost:8080/web2print/api/', values).subscribe(next => {
        console.log('response', next);

      },
      error => {
      console.log('error', error);
      });
  }
}

export interface FormData {
  name: string;
  value: string;
}
