import { Component, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/from';
import { concatMap } from 'rxjs/operators';


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
    'Standard',
    'Euro Computer',
    'US Computer',
    'American modified'
  ]

  url="https://brailletranslator.azurewebsites.net/api/Translate";

  constructor(private http: HttpClient ) {

  }

  onSubmit() {
    this.output = ""
    if ( this.converterForm.controls['grade'].value === 'Grade 1' ) {
      this.output = this.converterForm.controls['input'].value; 
    } else {
      let sentences = this.converterForm.controls['input'].value.split('.');
      from(sentences).pipe(
         concatMap(sentence => this.http.post(this.url, this.makebody(sentence))),   
       // concatMap(sentence => this.http.get(this.url))
     
      ).
      subscribe((val: any) => this.output = this.output.concat(val.Output))  

    }
  }

  onClear() {
    this.converterForm.controls['input'].setValue('');
    this.output = "";
  }

  makebody(sentence) {
    return {
      "Grade" : this.converterForm.controls['grade'].value,

      "Standard" : this.converterForm.controls['standard'].value,

      "Text": sentence
    }
  }

}
