# Hot vs Cold observables

#### Cold observables start to emit values only when we subscribe to them (event producer inside).
- fromEvent()
- Subjects
- share(), shareReplay(), publish() etc - use Subjects inside

publish() === multicast(new Subject())
share() === multicast(() => new Subject()).refCount()
publishReplay() === multicast(new ReplaySubject())

#### Hot observables emit values always (producer outside).


### How make cold observable hot
```angular2html
  private makeHot<T>(cold: Observable<T>): Observable<T> {
    const subject: Subject<T> = new Subject<T>();
    cold.subscribe(subject);
    return new Observable((observer) => subject.subscribe(observer));
  }
```

#### Resources
- https://benlesh.medium.com/hot-vs-cold-observables-f8094ed53339
- https://itnext.io/the-magic-of-rxjs-sharing-operators-and-their-differences-3a03d699d255
