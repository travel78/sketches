import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'custom-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public cpForm: FormGroup;
  public passwordChanged = false;

  get f() {
    return this.cpForm.controls;
  }
  constructor(private api: AccountApiService) {
  }

  ngOnInit() {
    this.cpForm = new FormGroup({
      oldPassword: new FormControl(null, [Validators.required]),
      newPassword: new FormControl(null, [Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&\\.,#^=~`_|;:\'><{}()\\[\\]\\-"\\/\\\\])[A-Za-z\\d@$!%*?&\\.,#^=~`_|;:\'><{}\\[\\]()\\-"\\/\\\\]{8,}$')]),
      confirmNewPassword: new FormControl(null)
    }, {validators: this.passwordsMatchValidator});
  }

  private passwordsMatchValidator(form) {
    if (form.get('newPassword').value === form.get('confirmNewPassword').value) {
      return null;
    }
    return {passwordsDoNotMatch: true};
  }

  public onSubmit() {
    this.api.changePassword(this.cpForm.get('oldPassword').value, this.cpForm.get('newPassword').value).subscribe(
      () => {
        this.passwordChanged = true;
      }
    );
  }
}
