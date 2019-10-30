import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {interval} from "rxjs";
import {take} from "rxjs/operators";
import {SideshowService} from "@app/service/sideshow.service";

@Component({
  selector: 'custom-sideshow',
  templateUrl: './sideshow.component.html',
  styleUrls: ['./sideshow.component.scss']
})
export class SideshowComponent implements OnInit, AfterViewInit {
  @ViewChild('hole', {static: true}) hole: ElementRef;
  @ViewChild('info', {static: true}) info: ElementRef;
  public slides: Array<Element> = [];
  public currentSlideIndex = 0;
  private doNotShowAgain = false;
  public corner = 0;

  constructor(private renderer: Renderer2, private sideShowSer: SideshowService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const elms = document.getElementsByClassName('sideshow');
      for (let elIndex = 0; elIndex < elms.length; elIndex++) {
        const step = elms[elIndex].getAttribute('id');
        if (step) {
          this.slides[+step - 1] = elms[elIndex];
        }
      }
      // this.startSlide();
      this.calcPos(this.currentSlideIndex);
    }, 1000);
  }

  private startSlide() {
    interval(5000).pipe(
      take(3)
    ).subscribe(
      res => {
        this.currentSlideIndex = res;
        this.calcPos(this.currentSlideIndex);
      }
    );
  }

  private calcPos(index) {
    if (!this.slides[index]) {
      return;
    }
    this.corner = 0;
    this.renderer.setStyle(this.info.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.info.nativeElement, 'opacity', '0');
    const padding = 40;
    const rect = this.slides[index].getBoundingClientRect();
    this.setNewPosition(rect.top - padding, rect.left - padding, rect.width + padding * 2, rect.height + padding * 2);
  }

  private setNewPosition(top, left, width, height) {
    this.renderer.setStyle(this.hole.nativeElement, 'top', top + 'px');
    this.renderer.setStyle(this.hole.nativeElement, 'left', left + 'px');
    this.renderer.setStyle(this.hole.nativeElement, 'width', width + 'px');
    this.renderer.setStyle(this.hole.nativeElement, 'height', height + 'px');
    this.renderer.setStyle(this.info.nativeElement, 'display', 'flex');

    setTimeout(() => {
      this.setInfoPos();
    }, 1500);
  }

  private setInfoPos() {
    const holeRect = this.hole.nativeElement.getBoundingClientRect();
    const infoWidth = this.info.nativeElement.getBoundingClientRect().width;
    const infoHeight = this.info.nativeElement.getBoundingClientRect().height;
    let infoLeft;
    let leftCorner;
    if ((holeRect.left + 30) < infoWidth) {
      infoLeft = holeRect.width + 30;
      leftCorner = true;
    } else {
      infoLeft = -infoWidth - 30;
      leftCorner = false;
    }
    this.renderer.setStyle(this.info.nativeElement, 'left', infoLeft + 'px');
    let infoTop;
    if ((holeRect.top + 30) < infoHeight) {
      infoTop = holeRect.height + 30;
      this.corner = leftCorner ? 3 : 4;
    } else {
      infoTop = -infoHeight - 30;
      this.corner = leftCorner ? 2 : 1;
    }
    this.renderer.setStyle(this.info.nativeElement, 'top', infoTop + 'px');
    this.renderer.setStyle(this.info.nativeElement, 'opacity', '1');

  }

  public onShowNext() {
    if (this.currentSlideIndex === 2) {
      return;
    }
    this.currentSlideIndex = this.currentSlideIndex + 1;
    this.calcPos(this.currentSlideIndex);
  }

  public onClose() {
    this.sideShowSer.hide(this.doNotShowAgain);
  }

  public onCheck(event) {
    this.doNotShowAgain = event.checked;
  }
}
