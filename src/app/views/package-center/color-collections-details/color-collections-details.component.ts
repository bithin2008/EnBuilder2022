import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-color-collections-details',
    templateUrl: './color-collections-details.component.html',
    styleUrls: ['./color-collections-details.component.css']
})
export class ColorCollectionsDetailsComponent implements OnInit {

    defaultActiveTab: any = 'generalTab';
    collectionId: string;
    collectionDetailsObj: any;
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
        if (localStorage.getItem('colorCollectionDetailActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('colorCollectionDetailActiveTab');
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

    getColorCollectionDetails() {
        this.collectionId = this._activatedRoute.snapshot.paramMap.get("collectionId");
        let url = `package-center/color-collections?_id=${this.collectionId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.collectionDetailsObj = response.result;
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

    deleteColorCollection() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this color collection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/color-collections?_id=${this.collectionId}`;
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
            localStorage.setItem('colorCollectionDetailActiveTab', 'generalTab');
        }
        if (event.nextId == 'itemsTab') {
            localStorage.setItem('colorCollectionDetailActiveTab', 'itemsTab');
        }
        if (event.nextId == 'packagesTab') {
            localStorage.setItem('colorCollectionDetailActiveTab', 'packagesTab');
        }
        if (event.nextId == 'optionsTab') {
            localStorage.setItem('colorCollectionDetailActiveTab', 'optionsTab');
        }
        if (event.nextId == 'modelsTab') {
            localStorage.setItem('colorCollectionDetailActiveTab', 'modelsTab');
        }
        if (event.nextId == 'unitTab') {
            localStorage.setItem('colorCollectionDetailActiveTab', 'unitTab');
        }

    }


}
