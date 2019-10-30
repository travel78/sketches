import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { interval, Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import * as Hls from 'hls.js';



@Component({
  selector: 'custom-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit, OnDestroy {
  public songs: Array<TrackModel> = [];
  public version: TrackVersionModel;
  public versionName: string;
  private shouldPlay = true;
  public songIndex = 0;
  public loadPercent = 0;
  public loadMin = '';
  public duration = '';
  private seekSubsc: Subscription;
  private _onDestroy = new Subject();
  public volume = 0.4;
  public repeat = 0;
  private hls: Hls;
  private audio;
  public shuffled = false;
  private priority: Array<PriorityModel> = [];
  public sprite: SafeStyle = this.sanitizer.bypassSecurityTrustStyle('url(assets/sprites/ray-hv.png)');
  private shouldSeek = false;
  private isSeeked = false;

  public isNotHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
    .pipe(
      map(result => {
        return !result.matches;
      })
    );

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space' && (event as any).target.localName !== 'input') {
      (document.activeElement as any).blur();
      event.preventDefault();
      event.stopPropagation();
      return this.onPlayPause();
    }
    if (event.code === 'ArrowRight' && (event as any).target.localName !== 'input') {
      if (this.shouldSeek) {
        this.isSeeked = true;
        this.seekRight();
      } else {
        this.shouldSeek = true;
      }
    }
    if (event.code === 'ArrowLeft' && (event as any).target.localName !== 'input') {
      if (this.shouldSeek) {
        this.isSeeked = true;
        this.seekLeft();
      } else {
        this.shouldSeek = true;
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardKeyupEvent(event: KeyboardEvent) {
    if (event.code === 'ArrowRight' && (event as any).target.localName !== 'input') {
      this.shouldSeek = false;
      if (this.isSeeked) {
        return this.isSeeked = false;
      } else {
        return this.onNextPreviouse(true, this.repeat);
      }
    }

    if (event.code === 'ArrowLeft' && (event as any).target.localName !== 'input') {
      this.shouldSeek = false;
      if (this.isSeeked) {
        return this.isSeeked = false;
      } else {
        return this.onNextPreviouse(false, this.repeat);
      }
    }
  }

  constructor(private playerService: PlayerService, private ref: ChangeDetectorRef,
              private mainApiService: ApiMainService, private sanitizer: DomSanitizer,
              private crateSer: SomeService, private accountSer: ApiService,
              private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit() {
    this.getPriorities();
    this.initReceiveDataListener();
  }

  private seekRight() {
    if (!this.audio) {
      return;
    }
    const playTime = this.audio.currentTime + 1;
    if (playTime > this.audio.duration) {
      return;
    }

    this.audio.currentTime = playTime;
    this.changeSeek();
  }

  private seekLeft() {
    if (!this.audio) {
      return;
    }
    let playTime = this.audio.currentTime - 1;
    if (playTime < 0) {
      playTime = 0;
    }
    this.audio.currentTime = playTime;
    this.changeSeek();
  }

  private createHls() {
    this.destroyHls();
    this.getVersion();
    this.getSprite();
    this.hls = new Hls(
      {
        xhrSetup: (xhr: any, url) => {
          if ((url as string).includes('m3u8')) {
            xhr.setRequestHeader('authorization', this.getToken());
            xhr.setRequestHeader('Cache-Control', 'no-store');
            xhr.setRequestHeader('Files', this.version.filename);
          }
        }
      }
    );
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (this.shouldPlay) {
        this.audio.play();
        this.startRefreshPosition();
      }
    });
    this.uploadSong();
  }

  private initReceiveDataListener() {
    this.playerService.getListObs().pipe(
      takeUntil(this._onDestroy)
    ).subscribe(
      data => {
        if (data.index < 0) {
          return this.onPlayPause();
        }
        this.versionName = data.version;
        this.songs = data.list;
        this.songIndex = data.index;
        this.shouldPlay = true;
        this.shuffled = false;
        this.createHls();
      }
    );
  }

  private uploadSong() {
    this.audio = new Audio() as any;
    this.audio.volume = this.volume;
    this.hls.attachMedia(this.audio);
    this.hls.loadSource(this.version.song_url);
    this.duration = (!isNaN(this.version.duration)) ? this.convertSeconds(this.version.duration) : '0';
    this.audio.onended = () => {
      this.stopRefreshPosition();
      this.onNextPreviouse(true, this.repeat);
    };
    this.changeSeek();
    this.ref.markForCheck();
    this.playerService.setCurrentSong({
      trackId: this.songs[this.songIndex].id,
      version: this.version.version,
      isPlaying: this.shouldPlay
    });
  }

  private startRefreshPosition() {
    if (this.seekSubsc && !this.seekSubsc.closed) {
      return;
    }
    this.seekSubsc = interval(1000).subscribe((num) => {
      this.changeSeek();
    });
  }

  private stopRefreshPosition() {
    if (this.seekSubsc) {
      this.seekSubsc.unsubscribe();
    }
  }


  public onPlayPause() {
    if (this.audio) {
      if (this.audio.paused) {
        this.audio.play();
        this.shouldPlay = true;
        this.startRefreshPosition();
      } else {
        this.shouldPlay = false;
        this.audio.pause();
        this.stopRefreshPosition();
      }
      const isPlaying = this.isPlaying();
      this.changeSeek();
      this.playerService.setCurrentSong({
        trackId: this.songs[this.songIndex].id,
        version: this.version.version,
        isPlaying
      });
    }
  }

  public onNextPreviouse(next: boolean, repeat) {
    if (!this.audio) {
      return;
    }
    if (repeat === 1) {
      return this.createHls();
    }
    if (this.shuffled) {
      this.songIndex = this.getRandomNum(this.songs.length);
      return this.createHls();
    }
    if (next) {
      if (repeat === 2) {
        this.songIndex = this.songIndex === (this.songs.length - 1) ? 0 : this.songIndex + 1;
      } else {
        if (this.songIndex === (this.songs.length - 1)) {
          return;
        }
        this.songIndex = this.songIndex + 1;
      }
    } else {
      if (repeat === 2) {
        this.songIndex = this.songIndex === 0 ? this.songs.length - 1 : this.songIndex - 1;
      } else {
        if (this.songIndex === 0) {
          return;
        }
        this.songIndex = this.songIndex - 1;
      }
    }
    this.createHls();
  }

  private getRandomNum(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  public onSeek(event: MouseEvent, element: any) {
    if (!this.audio) {
      return;
    }
    const playTime = this.version.duration * (event.offsetX / element.offsetWidth);
    if (playTime > this.audio.duration) {
      return this.onNextPreviouse(true, this.repeat);
    }

    this.audio.currentTime = playTime;
    this.changeSeek();
  }

  private changeSeek() {
    const currentSec = this.audio.currentTime as number;
    this.loadPercent = (currentSec / this.version.duration) * 100;
    this.loadMin = (!isNaN(currentSec)) ? this.convertSeconds(currentSec) : '0';
    if (!this.isPlaying()) {
      setTimeout(() => {
        this.ref.markForCheck();
      }, 200);
    } else {
      this.ref.markForCheck();
    }
  }

  private convertSeconds(seconds) {
    const hours = seconds / 3600;
    const minutes = (seconds % 3600) / 60;
    seconds %= 60;
    return [hours, minutes, seconds].map(val => ('0' + Math.floor(val)).slice(-2)).join(':');
  }


  public onChangeVolume(event: number) {
    this.volume = event;
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  public isPlaying() {
    return this.audio ? !this.audio.paused : false;
  }

  private getToken() {
    const len = localStorage.length;
    for (let i = 0; i < len; i++) {
      if (localStorage.key(i).includes('accessToken')) {
        return 'Bearer ' + localStorage.getItem(localStorage.key(i));
      }
    }
  }

  private getPriorities() {
    this.accountSer.getPriorities().pipe(
      map(prior => prior.sort((el1, el2) => el1.order - el2.order))
    ).subscribe(res => this.priority = res);
  }

  public getWidth() {
    if (!this.audio) {
      return 0;
    }
    const differ = this.audio.duration / this.version.duration;
    return 100 - differ * 100;
  }

  private getVersion() {
    const versions = this.songs[this.songIndex].versions;
    if (versions.length === 1 || this.priority.length === 0) {
      return this.version = versions[0];
    }
    if (this.versionName) {
      this.version = versions.find(ver => ver.version === this.versionName);
      this.versionName = null;
      if (this.version) {
        return this.version;
      }
    }
    this.version = (this.priority as any).reduce(
      (accum, pr) => accum ? accum : versions.find(ver => ver.version === pr.name), null);
    if (!this.version) {
      return this.version = versions[0];
    }
  }

  public onLike() {
    let like = this.songs[this.songIndex].liked;
    like = like === 1 ? 0 : 1;
    this.updateLike(this.songs[this.songIndex].id, like);
  }

  public onUnlike() {
    let like = this.songs[this.songIndex].liked;
    like = like === -1 ? 0 : -1;
    this.updateLike(this.songs[this.songIndex].id, like);
  }

  private updateLike(id, rate) {
    this.songs[this.songIndex].liked = rate;
    this.mainApiService.like(id, rate).subscribe(
      () => this.playerService.setCurrentSong({trackId: id, version: this.version.version})
    );
  }

  public onAddToCrate() {
    if (this.songs.length === 0 || !this.version.version) {
      return;
    }
    this.crateSer.addSongsToCrate([{
      trackid: this.songs[this.songIndex].id,
      version: this.version.version
    }]);
  }

  private destroyHls() {
    if (this.hls) {
      this.hls.stopLoad();
      this.hls.destroy();
      delete this.hls;
    }
  }

  public getSprite() {
    this.sprite = (this.version && this.version.sprite_url) ? this.sanitizer.bypassSecurityTrustStyle(`url(\'${this.version.sprite_url}\')`) :
      this.sanitizer.bypassSecurityTrustStyle('url(assets/sprites/ray-hv.png)');
    this.ref.markForCheck();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this.stopRefreshPosition();
    this.destroyHls();
    this.playerService.setCurrentSong({});
  }

  public onNext() {
    this.onNextPreviouse(true, 0);
  }

  public onPreviouse() {
    this.onNextPreviouse(false, 0);
  }
}
