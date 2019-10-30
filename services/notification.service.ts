import { Injectable, NgZone } from '@angular/core';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';


declare type HorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
declare type VerticalPosition = 'bottom' | 'top';

@Injectable()
export class NotificationService {
  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly zone: NgZone
  ) {
  }

  public default(message: string, horizontalPosition: HorizontalPosition = 'center', verticalPosition: VerticalPosition = 'top') {
    this.show(message, {
      duration: 2000,
      panelClass: 'default-notification-overlay',
      horizontalPosition,
      verticalPosition
    });
  }

  public info(message: string, horizontalPosition: HorizontalPosition = 'center', verticalPosition: VerticalPosition = 'top') {
    this.show(message, {
      duration: 2000,
      panelClass: 'info-notification-overlay',
      horizontalPosition,
      verticalPosition
    });
  }

  public success(message: string, horizontalPosition: HorizontalPosition = 'center', verticalPosition: VerticalPosition = 'top') {
    this.show(message, {
      duration: 2000,
      panelClass: 'success-notification-overlay',
      horizontalPosition,
      verticalPosition
    });
  }

  public warn(message: string, horizontalPosition: HorizontalPosition = 'center', verticalPosition: VerticalPosition = 'top') {
    this.show(message, {
      duration: 2500,
      panelClass: 'warning-notification-overlay',
      horizontalPosition,
      verticalPosition
    });
  }

  public error(message: string, horizontalPosition: HorizontalPosition = 'center', verticalPosition: VerticalPosition = 'top') {
    this.show(message, {
      duration: 3000,
      panelClass: 'error-notification-overlay',
      horizontalPosition,
      verticalPosition
    });
  }

  private show(message: string, configuration: MatSnackBarConfig) {
    this.zone.run(() => this.snackBar.open(message, null, configuration));
  }
}
