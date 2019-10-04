import { Component, Output, Pipe, PipeTransform } from '@angular/core';
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
    grade: new FormControl('Grade 1', Validators.required),
    standard: new FormControl('Standard', Validators.required),
    input: new FormControl('', Validators.required),
    filter: new FormControl('ALL')
  });
  output: any;
  selectedTab = "translator";
  rules: any = [];

  grades = [
    "Grade 1",
    "Grade 2",
    "Grade 3"
  ];

  filters = [
    "ALL",
    "POSTFIX",
    "CONTAINS",
    "PREFIX",
    "WORD",
    "NUMBER"
  ]

  standards = [
    'Standard',
    'Euro Computer',
    'US Computer',
    'American modified'
  ]

  url = "https://brailletranslator.azurewebsites.net/api/Translate";
  urlRules = "https://brailletranslator.azurewebsites.net/api/Rules";

  constructor(private http: HttpClient) {

  }

  onSubmit() {
    this.output = ""
    let sentences = this.converterForm.controls['input'].value.split('.');
    from(sentences).pipe(
      concatMap(sentence => this.http.post(this.url, this.makebody(sentence))),
      // concatMap(sentence => this.http.get(this.url))

    ).
      subscribe((val: any) => {
        this.output = this.output.concat(val.Output);
        console.log(this.output);
      })
  }

  onClear() {
    this.converterForm.controls['input'].setValue('');
    this.output = "";
  }

  makebody(sentence) {
    return {
      "Grade": this.converterForm.controls['grade'].value,

      "Standard": this.converterForm.controls['standard'].value,

      "Text": sentence
    }
  }

  changeTab(tabName) {
    this.selectedTab = tabName
  }

  getRules() {
    this.rules = []
    this.http.get(this.urlRules + '/' + this.converterForm.controls['grade'].value +
      '/' + this.converterForm.controls['standard'].value)
      .subscribe((data) => {
        this.rules = data;
      });
  }

}

@Pipe({ name: 'ruleTypeFilter' })
export class RulePipe implements PipeTransform {
  transform(rules: any[], filterString: string): any[] {
    return !filterString || filterString === "ALL" ? rules : rules.filter(x => x.ruleType === filterString);
  }
}
