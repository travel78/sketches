import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'some-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Output() data = new EventEmitter();
  public filterForm: FormGroup;
  public filters: FiltersModel;
  public subtypes = [];
  @Input() showStatus = false;
  private _inputData: QueryParamsModel;
  @Input('inputData') set inputData(params: QueryParamsModel) {
    this._inputData = params;
    if (this.filters) {
      this.addDataFromQuery();
    }
  };


  constructor(private notSer: NotificationService, private api: ApiService) {
  }

  ngOnInit() {
    if (!this.filterForm) {
      this.createForm();
    }
  }

  private createForm() {
    this.filterForm = new FormGroup({
      from: new FormControl(),
      to: new FormControl(),
      type: new FormControl(),
      subtype: new FormControl(),
      site: new FormControl(),
      processed: new FormControl(),
      email: new FormControl()
    });
    this.fillForm();
    this.addDataFromQuery();
    this.filterForm.get('type').valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(
      data => {
        this.filterForm.get('subtype').reset(null);
        const found = this.filters.types.find(
          (el) => {
            return el.id === data;
          }
        );
        this.subtypes = found ? found.subtypes : [];
      }
    );
  }

  public onFilterApply() {
    const data = this.getData();
    if (data.to < data.from) {
      return this.notSer.error('End date should be before start date');
    }
    this.data.emit(data);
  }

  private getData() {
    const data = {...this.filterForm.value};
    data.to = data.to ? (data.to as Date).getTime() : Date.now().valueOf();
    data.from = data.from ? (data.from as Date).getTime() : 0;
    return this.clean(data);
  }

  private clean(obj) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName].length === 0) {
        delete obj[propName];
      }
    }
    return obj;
  }

  private fillForm() {
    this.api.getFilters().subscribe(
      res => {
        this.filters = res;
        if (this._inputData) {
          this.addDataFromQuery();
        }
      }
    );
  }

  private addDataFromQuery() {
    if (Number.isInteger(+this._inputData.from)) {
      const from = new Date(+this._inputData.from);
      this.filterForm.get('from').setValue(from);
    }
    if (Number.isInteger(+this._inputData.to)) {
      const to = new Date(+this._inputData.to);
      this.filterForm.get('to').setValue(to);
    }
    this.filterForm.get('type').setValue(this._inputData.type);
    this.filterForm.get('subtype').setValue(this._inputData.subtype);
    this.filterForm.get('site').setValue(this._inputData.site);
    if (this.showStatus) {
      this.filterForm.get('processed').setValue(this._inputData.processed);
      this.filterForm.get('email').setValue(this._inputData.email);
    }
  }

  public clearEmail() {
    this.filterForm.get('email').reset(null);
    this.onFilterApply();
  }
}
