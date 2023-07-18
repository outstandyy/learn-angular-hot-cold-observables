import { Component, OnInit, Renderer2 } from '@angular/core';
import { ConnectableObservable, map, multicast, Observable, of, share, Subject, Subscriber, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <main>
      <h1>Hot / Cold observables</h1>
    </main>

    <button id="test-button">Test button</button>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private testUrl: string = 'https://jsonplaceholder.typicode.com/todos/1';

  user$!: Observable<any>;
  userHot$!: Observable<any>;
  id$!: Observable<number>;
  name$!: Observable<string>;

  constructor(private http: HttpClient, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.user$ = this.http.get(this.testUrl)
      .pipe(
        tap((value) => console.log('requested: ', value)),
        // share()
        // multicast(new Subject()),
      );

    // cold
    this.getData(this.user$);
    this.getData(this.user$);
    this.getData(this.user$);

    // hot
    this.userHot$ = this.makeHot<any>(this.user$);
    this.getData(this.userHot$);
    this.getData(this.userHot$);
    this.getData(this.userHot$);

    // const obs$: Observable<any> = of(null).pipe(map(Math.random));
    const obs$: Observable<any> = fromTimestamp();
    obs$.subscribe((value) => console.log(value))
    //
    // setTimeout(() => obs$.subscribe((value) => console.log(value)), 2000);

  }

  private getData(obs: Observable<any>): void {
    obs
      .pipe(
        map(user => user.id)
      )
      .subscribe((value) => {
        console.log('id: ', value);
      });
  }

  private makeHot<T>(cold: Observable<T>): Observable<T> {
    const subject: Subject<T> = new Subject<T>();
    // cold.subscribe((v) => console.log('--cold subscribe: ', v))
    // subject.subscribe((v) => console.log('--subject subscribe: ', v))
    cold.subscribe(subject);
    return new Observable((observer) => subject.subscribe(observer));
  }

  private makeHotRefCounted(cold: Observable<any>): Observable<any> {
    const subject = new Subject();
    const mainSub = cold.subscribe(subject);
    let refs = 0;
    return new Observable(observer => {
      refs++;
      let sub = subject.subscribe(observer);
      return () => {
        refs--;
        if (refs === 0) {
          mainSub.unsubscribe();
        }
        sub.unsubscribe();
      }
    });
  }
}

// cold observable (create source per each subscriber inside)
const fromTimestamp = (): Observable<number> => {
  return new Observable((subscriber: Subscriber<any>) => {
    const timestamp: number = Date.now();
    subscriber.next(timestamp);
  });
}
