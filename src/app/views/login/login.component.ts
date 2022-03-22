import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  token: any;
  queryParams: any = {};
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private webService: WebService,
    private toastr: ToastrService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
  }
  ngOnInit() {
    this.activatedRoute.queryParams
      .subscribe(params => {
        console.log(params);
        this.queryParams = params;
      });
    this.checkLogin();
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  get f() { return this.loginForm.controls; }
  checkLogin() {
    let url = 'whoami';
    this.webService.get(url).subscribe((response: any) => {
      if (response.success) {
        if (response.result.isGuest) {
          // stay in login page
        }
        else {
          let firstName = response.result.user.firstName || response.result.user.first_name;
          let lastName = response.result.user.lastName || response.result.user.last_name;
          let middleName = '';
          if (response.result.user.middleName || response.result.user.middle_name) {
            middleName = response.result.user.middleName || response.result.user.middle_name;
          }
          let username = firstName + ' ' + middleName + ' ' + lastName;
          localStorage.setItem("username", username);
          var token = response.result.session._id;
          localStorage.setItem('token', token);
          var userId = response.result.user._id;;
          localStorage.setItem('userId', userId);
          if (this.queryParams.return_url)
            this.router.navigate([`/${this.queryParams.return_url}`]);
          else
            this.router.navigate([`/home`]);
        }
      }
    }, (error) => {
      this.toastr.error(error, 'Error!');
    })
  }
  login() {
    let url = 'login';
    if (!this.f.email.value) {
      this.toastr.warning('Email is Mandatory', 'Warning');
    } else if (!this.f.password.value) {
      this.toastr.warning('Password is Mandatory', 'Warning');
    } else {
      let data = {
        email: this.f.email.value,
        password: this.f.password.value
      }
      this.spinnerService.show();
      this.webService.login(data, url).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.status == 1) {
          if (response.result) {
            localStorage.setItem("token", response.result.session._id);
            let firstName = response.result.user.firstName || response.result.user.first_name;
            let lastName = response.result.user.lastName || response.result.user.last_name;
            let middleName = '';
            if (response.result.user.middleName || response.result.user.middle_name) {
              middleName = response.result.user.middleName || response.result.user.middle_name;
            }
            let username = firstName + ' ' + middleName + ' ' + lastName;
            localStorage.setItem("username", username);
            this.toastr.success('Login Successfully', 'Success');
            if (this.queryParams.return_url)
              this.router.navigate([`/${this.queryParams.return_url}`]);
            else
              this.router.navigate([`/home`]);
          } else {
            this.toastr.error(response.results.error, 'Error');
          }
        } else {
          this.toastr.error(response.message, 'Error');
        }
      }, (error) => {
        console.log("error ts: ", error);
        this.toastr.error(error);
      })
    }
  }
}
