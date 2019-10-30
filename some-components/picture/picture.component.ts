import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable, Observer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


@Component({
  selector: 'custom-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss']
})
export class PictureComponent implements OnInit {
  public pictureToUpdate: any;
  public logoToUpdate: any;
  public isPictureHovering = false;
  public isLogoHovering = false;
  public userPhoto: Observable<string>;

  constructor(private sanitizer: DomSanitizer, private notService: NotificationService,
              private accountSer: SomeService, private helperSer: HelpersService) {
  }

  ngOnInit() {
    this.userPhoto = this.accountSer.getUserInfo().pipe(
      map(res => res.picture)
    );
  }


  public toggleHover(event: boolean, isPicture) {
    if (isPicture) {
      this.isPictureHovering = event;
    } else {
      this.isLogoHovering = event;
    }
  }

  public startUpload(event: any, select: boolean, isPicture: boolean) {
    let file;
    if (select) {
      if (event.target.files && event.target.files[0]) {
        file = event.target.files[0];
      }
    } else {
      file = event.item(0);
    }
    if (!file) {
      return;
    }
    if (file.type.split('/')[0] !== 'image') {
      return this.notService.warn('unsupported file type :( ');
    }
    if (file.size > 2000000) {
      return this.notService.warn('The img cannot be more than 2000kb');
    }

    this.helperSer.getBase64Obs(file).pipe(
      switchMap(data => this.resizeImage(data))
    ).subscribe(
      res => {
        if (isPicture) {
          this.pictureToUpdate = res;
        } else {
          this.logoToUpdate = res;
        }
      },
      () => this.notService.warn('Unsupported type of picture')
    );
  }

  public onUpdate() {
    const data: any = {};
    if (this.logoToUpdate) {
      data.logo = this.helperSer.clearBase64(this.logoToUpdate);
    }
    if (this.pictureToUpdate) {
      data.picture = this.helperSer.clearBase64(this.pictureToUpdate);
    }
    this.accountSer.updatePictures(data).subscribe(
      () => {
        this.pictureToUpdate = null;
        this.logoToUpdate = null;
      }
    );
  }

  public getPicture() {
    return this.pictureToUpdate ? this.sanitizer.bypassSecurityTrustStyle('url(' + this.pictureToUpdate + ')') : null;
  }

  public getLogo() {
    return this.logoToUpdate ? this.sanitizer.bypassSecurityTrustStyle('url(' + this.logoToUpdate + ')') : null;
  }

  private resizeImage(data) {
    return new Observable((observer: Observer<any>) => {
      const img = new Image();
      img.src = data;
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const canvasCopy = document.createElement('canvas');
        const copyContext = canvasCopy.getContext('2d');

        const imgSize = Math.min(img.width, img.height);
        const left = (img.width - imgSize) / 2;
        const top = (img.height - imgSize) / 2;
        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, left, top, imgSize, imgSize, 0, 0, copyContext.canvas.width, copyContext.canvas.height);

        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, 200, 200);


        const res = canvas.toDataURL('image/png');
        observer.next(res);
        observer.complete();
      };
      img.onerror = function (error) {
        observer.error(error);
        observer.complete();
      };
    });
  }
}
