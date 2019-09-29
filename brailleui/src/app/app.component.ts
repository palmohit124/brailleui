import { Component, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  converterForm = new FormGroup({
    grade: new FormControl('', Validators.required),
    standard: new FormControl('', Validators.required),
    input: new FormControl('', Validators.required)
  });
  output: any;

  grades = [
    "Grade 1",
    "Grade 2",
    "Grade 3"
  ];

  standards = [
    "Standard"
  ]

  onSubmit() {
    if ( this.converterForm.controls['grade'].value === 'Grade 1' ) {
      this.output = this.converterForm.controls['input'].value; 
    }
  }

  onClear() {
    this.converterForm.controls['input'].setValue('');
    this.output = "";
  }

}
