import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-collections',
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit {
    modalRef: BsModalRef;
    baseUrl = environment.BASE_URL;
    formDetails: any = {};
    isEdit: boolean = false;
    isClear: boolean = false;
    bookId = '';
    collections = [];
    bookDetails: any = {};
    selectedAllCollection: boolean = false;
    constructor(
        private router: Router,
        public activatedRoute: ActivatedRoute,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private changeDetect: ChangeDetectorRef,
        private confirmationDialogService: ConfirmationDialogService
    ) {
        this.bookId = this.activatedRoute.snapshot.paramMap.get("bookId");
    }
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
    }

    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {

                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                }
                else {
                    this.getBookDetails();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });

            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    getBookDetails() {
        this.spinnerService.show();
        let url = `purchaser-portal/books?_id=${this.bookId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.result) {
                this.bookDetails = response.result;
            }
            else {
                this.bookDetails = {};
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getCollections() {
        this.spinnerService.show();
        let url = `purchaser-portal/collections?book_id=${this.bookId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.collections = response.results && response.results.rows ? response.results.rows : [];
            }
            else {
                this.collections = [];
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    selectAllCollection() {
        for (var i = 0; i < this.collections.length; i++) {
            this.collections[i].is_selected = this.selectedAllCollection;
        }
    }
    openAddCollectionModal(template: TemplateRef<any>) {
        this.getCollections();
        this.isEdit = false;
        this.selectedAllCollection = false;
        this.formDetails = {
            name: this.bookDetails.name,
            collections: []
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    addOrUpdateBook() {
        let selectedElements = this.collections.filter(element => element.is_selected);
        if (selectedElements.length == 0) {
            this.toastr.error('Please select atleast one collection', 'Error');
        }
        else {
            let data: any = {
                _id: this.bookId,
                collections: []
            };
            if (this.bookDetails.collections) {
                data.collections = this.bookDetails.collections;
            }
            for (let index = 0; index < selectedElements.length; index++) {
                data.collections.push(selectedElements[index]._id);
            }
            let url = `purchaser-portal/books`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                if (response.status == 1) {
                    this.spinnerService.hide();
                    this.getBookDetails();
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                    this.spinnerService.hide();
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    deleteCollection(event, item) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete the book '${item.name}'?`)
            .then((confirmed) => {
                if (confirmed) {
                    let selectedElements = this.bookDetails.collections.filter(element => element != item._id);
                    let data: any = {
                        _id: this.bookId,
                        collections: selectedElements
                    };
                    let url = `purchaser-portal/books?_id=${this.bookId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getBookDetails();
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
    goBack() {
        this.router.navigate([`/purchaser-admin`]);
    }
    goToDetails(id) {
        this.router.navigate([`/purchaser-admin/collection-details/${this.bookId}/${id}`]);
    }
    navigateToPagesApp() {
        let url = `/apps/pages/index.html`;
        window.open(url, '_blank');
    }
}
