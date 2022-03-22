import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-options-details',
    templateUrl: './options-details.component.html',
    styleUrls: ['./options-details.component.css']
})
export class OptionsDetailsComponent implements OnInit {

    defaultActiveTab: any = 'generalTab';
    optionId: string;
    optionDetailsObj: any;
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
        if (localStorage.getItem('optionsDetailActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('optionsDetailActiveTab');
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
                    this.getColorCollectionDetails();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    goToPackageCenter() {
        this.router.navigate(['package-center']);
    }

    getColorCollectionDetails() {
        this.optionId = this._activatedRoute.snapshot.paramMap.get("optionId");
        let url = `package-center/options?_id=${this.optionId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.optionDetailsObj = response.result;
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onDetailsEvent(event) {
        if (event) {
            this.getColorCollectionDetails();
        }
    }

    doTabFunctions(event) {
        if (event.nextId == 'generalTab') {
            localStorage.setItem('optionsDetailActiveTab', 'generalTab');
        }
        if (event.nextId == 'collectionsTab') {
            localStorage.setItem('optionsDetailActiveTab', 'collectionsTab');
        }
        if (event.nextId == 'packagesTab') {
            localStorage.setItem('optionsDetailActiveTab', 'packagesTab');
        }
        if (event.nextId == 'optionsTab') {
            localStorage.setItem('optionsDetailActiveTab', 'optionsTab');
        }
        if (event.nextId == 'modelsTab') {
            localStorage.setItem('optionsDetailActiveTab', 'modelsTab');
        }
        if (event.nextId == 'unitTab') {
            localStorage.setItem('optionsDetailActiveTab', 'unitTab');
        }


    }


}
