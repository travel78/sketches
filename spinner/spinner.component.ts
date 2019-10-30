import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SpinnerService} from './spinner.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent implements OnInit, OnDestroy {
  private _onDestroy = new Subject();
  public show = false;
  public background = false;
  @Input('loaderId') id = 'root';

  constructor(private spinnerSer: SpinnerService, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.spinnerSer.events().pipe(
      takeUntil<any>(this._onDestroy)
    ).subscribe(
      data => {
        if (data.id === this.id) {
          this.background = data.background;
          this.show = data.type === 'start';
          this.ref.detectChanges();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
  }
}
