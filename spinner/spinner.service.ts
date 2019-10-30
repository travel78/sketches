import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, take } from 'rxjs/operators';

@Injectable()
export class SpinnerService {
  private startStop = new ReplaySubject<{ type: string; id: string, background: boolean }>(1);
  private isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
    .pipe(
      take<any>(1),
      map(result => {
        return result.matches;
      })
    );

  constructor(private breakpointObserver: BreakpointObserver) {
  }

  public startSpinner(id: string = 'root') {
    this.isHandset$.subscribe(res => {
      res ? id = 'root' : null;
      this.startStop.next({id, type: 'start', background: false});
    });
  }

  public stopSpinner(id: string = 'root') {
    this.isHandset$.subscribe(res => {
      res ? id = 'root' : null;
      this.startStop.next({id, type: 'stop', background: false});
    });
  }

  public startBackSpinner() {
    this.startStop.next({id: 'root', type: 'start', background: true});
  }

  public stopBackSpinner() {
    this.startStop.next({id: 'root', type: 'stop', background: true});
  }

  public events() {
    return this.startStop.asObservable();
  }
}
