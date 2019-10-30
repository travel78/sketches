import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'custom-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent implements OnChanges {
  @Input() page;
  @Input() pageSize;
  @Input() collectionSize;
  @Input() maxSize;
  @Output() pageChange = new EventEmitter<number>();
  public showPrev = false;
  public showNext = false;
  public pages = [];
  private pagesCount = 0;
  public last: number;

  private getPagesToShow() {
    this.pagesCount = Math.ceil(this.collectionSize / this.pageSize);
    this.last = this.pagesCount > 1 ? this.pagesCount : null;
    if (this.pagesCount < 3) {
      this.showPrev = false;
      this.showNext = false;
      this.pages = [];
      return;
    }

    const pages = Array(this.pagesCount).fill(null).map((x, i) => i + 1);
    pages.pop();
    pages.shift();
    let from = this.page > 1 ? (this.page - 2) : (this.page - 1);
    if ((this.pagesCount - this.page) < this.maxSize) {
      from = this.pagesCount - this.maxSize - 1;
    }
    if ((this.pagesCount - this.maxSize) < 1) {
      from = 0;
    }
    this.pages = pages.slice(from, from + this.maxSize);
    this.showPrev = this.pages[0] > 2;
    this.showNext = this.pages[this.pages.length - 1] < (this.pagesCount - 1);
    if (this.pages[0] === 3) {
      this.showPrev = false;
      this.pages.unshift(2);
      if (this.showNext) {
        this.pages.pop();
      }
    }

  }

  public changePageTo(page: number) {
    if (page === this.page) {
      return;
    }
    this.page = page;
    this.getPagesToShow();
    this.pageChange.emit(page);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getPagesToShow();
  }
}
