import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable()
export class SpinnerService {
  private ref: OverlayRef;
  private modalPortal: ComponentPortal<any>;

  constructor(private cfr: ComponentFactoryResolver, private overlay: Overlay) {
    const positionStrategy: PositionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.ref = this.overlay.create({hasBackdrop: true, disposeOnNavigation: true, positionStrategy});
    this.ref.backdropClick().subscribe(() => this.ref.detach());
    import('../component/spinner/spinner.component')
      .then(m => this.cfr.resolveComponentFactory(m.SpinnerComponent))
      .then(comp => this.modalPortal = new ComponentPortal(comp.componentType));
  }

  public showLoading(attempt = 5) {
    if (this.modalPortal) {
      return this.ref.attach(this.modalPortal);
    }
    if (attempt === 0) {
      return;
    }
    setTimeout(() => this.showLoading(attempt - 1), 200);
  }

  public hideLoading(delay = 100, attempt = 5) {
    if (this.ref.hasAttached()) {
      setTimeout(() => this.ref.detach(), delay);
    } else {
      if (attempt === 0) {
        return;
      }
      setTimeout(() => this.hideLoading(delay, attempt - 1), 100);
    }
  }
}
