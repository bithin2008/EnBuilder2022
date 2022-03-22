import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-package-details',
    templateUrl: './package-details.component.html',
    styleUrls: ['./package-details.component.css']
})
export class PackageDetailsComponent implements OnInit {

    defaultActiveTab: any = 'generalTab';
    packageId: string;
    packageDetailsObj: any;
    constructor(private router: Router,
        public _activatedRoute: ActivatedRoute,
        private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
        if (localStorage.getItem('packageDetailActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('packageDetailActiveTab');
        }
    }

    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
                }
                else {
                    this.getPackageDetails();
                }
            } else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });

            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    goToPackageCenter() {
        this.router.navigate(['package-center']);
    }

    getPackageDetails() {
        this.packageId = this._activatedRoute.snapshot.paramMap.get("packageId");
        let url = `package-center/packages?_id=${this.packageId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.packageDetailsObj = response.result;
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onDetailsEvent(event) {
        if (event) {
            this.getPackageDetails();
        }
    }

    deleteColorCollection() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this color package?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/packages?_id=${this.packageId}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.router.navigate(['/package-center']);
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    doTabFunctions(event) {
        if (event.nextId == 'generalTab') {
            localStorage.setItem('packageDetailActiveTab', 'generalTab');
        }
        if (event.nextId == 'collectionTab') {
            localStorage.setItem('packageDetailActiveTab', 'collectionTab');
        }
        if (event.nextId == 'packagesTab') {
            localStorage.setItem('packageDetailActiveTab', 'packagesTab');
        }
        if (event.nextId == 'modelsTab') {
            localStorage.setItem('packageDetailActiveTab', 'modelsTab');
        }
        if (event.nextId == 'unitTab') {
            localStorage.setItem('packageDetailActiveTab', 'unitTab');
        }
        if (event.nextId == 'includedOptionsTab') {
            localStorage.setItem('packageDetailActiveTab', 'includedOptionsTab');
        }

    }


}
