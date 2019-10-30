import { Injectable } from '@angular/core';
import { BaseApi } from '@app/service/base-api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';


@Injectable()
export class SomeApiService extends BaseApi {
  private priorities: Array<PriorityModel>;
  private user = new ReplaySubject<any>(1);
  private isAdminSub = new ReplaySubject<boolean>(1);


  constructor(private http: HttpClient, private router: Router,
              private dialog: MatDialog, spinnerSer: SomeSpinnerService,
              notSer: NotificationService {
    super(spinnerSer, notSer);
  }


}


