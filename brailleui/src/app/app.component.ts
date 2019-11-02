import { Component, Output, Pipe, PipeTransform, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/from';
import { concatMap } from 'rxjs/operators';
import { AppService } from './app.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'app';
  converterForm = new FormGroup({
    grade: new FormControl('Grade 1', Validators.required),
    standard: new FormControl('Standard', Validators.required),
    input: new FormControl('', Validators.required),
    filter: new FormControl('ALL')
  });
  output: any;
  selectedTab = "searchBooks";
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


  //SEARCH

  searchTerm$ = new Subject<string>();
  showAlert = false;
  bookList: Array<Object> = [];
  books: any;
  options = {
    url: 'http://skunkworks.ignitesol.com:8000/books?mime_type=image%2Fjpeg',
    ids:'',
    mime_type: '',
    search: '',
    topic: '',
    next: '',
    prev: ''
  };

  constructor(private http: HttpClient,
    private appService: AppService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getBooks(this.options);
    this.appService.search(this.searchTerm$, this.options)
      .subscribe((results: any) => {
        this.books = results;
        this.bookList = results.results
        this.refineFormats(this.bookList)
      });
  }

  openDialog(book: any): void {

    console.log('>>', book)
    const dialogRef = this.dialog.open(ConvertDialog, {
      height: '400px',
      width: '600px',
      data: book
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
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

  redirect(url) {
    if(url) {
      window.open(url, '_.blank')
    }
  }

  getBooks(topic) {
    this.appService.books(topic)
      .subscribe(
        (data: any) => {
          this.books = data;
          this.bookList = data.results;
          this.refineFormats(this.bookList);
        },
        (error) => {}
      )
  }

  refineFormats(bookList) {
    let refinedFormats: any = {}
    bookList.map((book) => {
      for(var key in book.formats) {
        if(book.formats.hasOwnProperty(key)) {
            if(book.formats[key].endsWith('htm')){
              refinedFormats[key] = book.formats[key]
            } else if(book.formats[key].endsWith('txt')) {
              refinedFormats[key] = book.formats[key]
            } else if(book.formats[key].endsWith('pdf')) {
              refinedFormats[key] = book.formats[key]
            }
        }
      }
      book.refinedFormats = refinedFormats;
      book.preferredFormat = book.refinedFormats[Object.keys(book.refinedFormats)[0]];
    })    
  }

  onClear() {
    this.converterForm.controls['input'].setValue('');
    this.output = "";
  }

  onScrollDown() {
    if(this.books.next) {
      this.options.next = this.books.next;
      this.append(this.options);
    }
  }

  append(options) {
    this.appService.moreBooks(options)
      .subscribe(
        (data: any) => {
          this.books = data
          this.refineFormats(data.results)
          this.bookList.push.apply(this.bookList, data.results)
        },
        (error) => {}
      )    
  }

  onScrollUp() {
    // Prepend items at a later stage
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

@Component({
  selector: 'convert-dialog',
  templateUrl: 'convert-dialog.html',
  styleUrls: ['./convert-dialog.scss']
})
export class ConvertDialog {

  converterDialogForm = new FormGroup({
    grade: new FormControl('Grade 1', Validators.required),
    standard: new FormControl('Standard', Validators.required)
  });

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

  url = "https://brailletranslator.azurewebsites.net/api/book";

  constructor(
    public dialogRef: MatDialogRef<ConvertDialog>,
    @Inject(MAT_DIALOG_DATA) public book: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    let request = {
      Grade: this.converterDialogForm.controls['grade'].value,
      Standard: this.converterDialogForm.controls['standard'].value,
      BookDetails: {
        Url: this.book.preferredFormat
      }
    };
  }

}
