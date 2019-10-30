import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from './notification.service';


export abstract class BaseApi {
  protected constructor(public spinnerSer: SomeSpinnerService, public notSer: NotificationService) {
  }

  public handler(promise, showNot = false, showSpinner = false, spinnerId = 'root') {
    if (showSpinner) {
      this.spinnerSer.startSpinner(spinnerId);
    }
    return fromPromise(promise).pipe(
      tap((res) => {
        if (showSpinner) {
          this.spinnerSer.stopSpinner(spinnerId);
        }
      }),
      catchError(
        err => {
          if (showSpinner) {
            this.spinnerSer.stopSpinner(spinnerId);
          }
          if (showNot) {
            if (err.response && err.response.data) {
              this.notSer.error(err.response.data.message || err.response.data );
            } else {
              this.notSer.error(err.message || 'Something unexpected has happened. Try again later');
            }
          }
          return throwError(err);
        }
      )
    );
  }
}
