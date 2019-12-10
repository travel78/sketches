import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  public signUpForm: FormGroup;
  public confirmPasswordInvalid = false;
  public passHidden = true;
  public repeatPassHidden = true;

  constructor(public dialogRef: MatDialogRef<SignUpComponent>, private mainApiService: MainApiService) {
  }

  ngOnInit() {
    this.signUpForm = new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [Validators.required, Validators.pattern(/(\d{9})|(.{20})/ig)])
    }, {validators: this.passwordsMatchValidator});
  }

  private passwordsMatchValidator(form) {
    if (form.get('password').value === form.get('confirmPassword').value) {
      return null;
    }
    return {
      passwordsDoNotMatch: true
    };
  }

  public confirmPasswordChange() {
    if (this.signUpForm.get('password').value === this.signUpForm.get('confirmPassword').value) {
      this.confirmPasswordInvalid = false;
      this.signUpForm.controls['confirmPassword'].setErrors(null);
    } else {
      this.confirmPasswordInvalid = true;
      this.signUpForm.controls['confirmPassword'].setErrors({'incorrect': true});
    }
  }

  public onSubmit() {
    const cred = this.signUpForm.value;
    delete cred.confirmPassword;
    this.mainApiService.signUp(cred).subscribe(
      (res: any) => {
        this.dialogRef.close({redirect: 'verify', requestId: res.requestId, ...cred});
      }
    );
  }

  public onTelClick(event: KeyboardEvent) {
    const val: any = event.key;
    const preVal = this.signUpForm.get('username').value;

    if (isNaN(val) || (preVal && preVal.length >= 9)) {
      event.preventDefault();
    }

  }

  public onTelBlur() {
    const preVal = this.signUpForm.get('username').value;
    if (!preVal || preVal.length === 0) {
      return;
    }

    let sub1 = preVal.trim().substring(0, 2);
    let sub2 = preVal.trim().substring(2, 5);
    let sub3 = preVal.trim().substring(5, 9);
    const intlCode = '+38 (0';
    let formatted = null;
    if (sub1.length > 0) {
      formatted = `${intlCode}${sub1})`;
    }
    if (sub2.length > 0) {
      formatted = `${intlCode}${sub1}) ${sub2}`;
    }
    if (sub3.length > 0) {
      formatted = `${intlCode}${sub1}) ${sub2} - ${sub3}`;
    }

    this.signUpForm.get('username').patchValue(formatted);
    this.signUpForm.get('username').updateValueAndValidity();
  }

  public onTelFocus() {
    const preVal: string = this.signUpForm.get('username').value;
    if (!preVal || preVal.length < 4) {
      return;
    }
    let newVal = preVal.replace('+38 (0', '').replace(/[- \)]{1}/ig, '');
    this.signUpForm.get('username').patchValue(newVal);
    this.signUpForm.get('username').updateValueAndValidity();
  }

}
