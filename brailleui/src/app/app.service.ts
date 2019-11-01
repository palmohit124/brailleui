import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/distinctUntilChanged';
import { distinctUntilChanged, switchMap, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  books(options) {
    return this.http.get(options.url)
  }

  moreBooks(options) {
    return this.http.get(options.next)
  }

  search(terms: Observable<string>, option) {
    return terms.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => this.searchEntries(term, option))
    )
  }

  searchEntries(term, option) {
    return this.http
        .get(option.url + "&topic=" + option.topic + "&search=" + term)
          //.map((res: any) => res.json());
  }
}
