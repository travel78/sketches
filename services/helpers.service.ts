import { Injectable } from '@angular/core';
import { NotificationService } from '@app/service';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class HelpersService {
  constructor(private notSer: NotificationService) {
  }

  public copyToClipboard(sourse: string, message: string) {
    const input = document.createElement('input');
    input.value = sourse;
    input.style.border = 'none';
    input.style.height = '0';
    input.style.padding = '0';
    document.getElementById('main').appendChild(input);
    input.select();
    document.execCommand('cut');
    document.getElementById('main').removeChild(input);
    this.notSer.info(message);
  }

  public getBase64Obs(file): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        observer.next(reader.result);
        observer.complete();
      };
      reader.onerror = function (error) {
        observer.error(error);
        observer.complete();
      };
    });
  }

  public clearBase64(img) {
    if (!img) {
      return null;
    }
    let encoded = (img as string).replace(/^data:(.*;base64,)?/, '');
    if ((encoded.length % 4) > 0) {
      encoded += '='.repeat(4 - (encoded.length % 4));
    }
    return encoded;
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
