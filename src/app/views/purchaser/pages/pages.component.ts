import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
    paginationObj: any = {};
    page = 1;
    pageSize = 20;
    pages = [];
    isClear: boolean = false;
    searchText = '';
    bookId = '';
    collectionId = '';
    collectionDetails: any = {};
    constructor(
        private router: Router,
        private webService: WebService,
        public activatedRoute: ActivatedRoute,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private changeDetect: ChangeDetectorRef,
        private confirmationDialogService: ConfirmationDialogService
    ) {
        this.bookId = this.activatedRoute.snapshot.paramMap.get("bookId");
        this.collectionId = this.activatedRoute.snapshot.paramMap.get("collectionId");
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
                    this.getCollectionDetails();
                    this.getPageData();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getCollectionDetails() {
        this.spinnerService.show();
        let url = `purchaser-portal/collections?_id=${this.collectionId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.result) {
                this.collectionDetails = response.result;
            }
            else {
                this.collectionDetails = {};
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getPageData() {
        this.spinnerService.show();
        let url = `purchaser-portal/pages?collection_id=${this.collectionId}&page=${this.page}&pageSize=${this.pageSize}&searchText=${this.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.pages = response.results && response.results.rows ? response.results.rows : [];
                this.paginationObj = response.results.pagination;
            }
            else {
                this.pages = [];
                this.paginationObj = {
                    total: 0
                }
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    doPaginationWise(page) {
        this.page = page;
        this.getPageData();
    }
    setPageSize() {
        this.page = 1;
        this.getPageData();
    }
    doSearch() {
        this.isClear = true;
        this.page = 1;
        this.getPageData();
    }
    clearSearch() {
        this.isClear = false;
        this.searchText = '';
        this.page = 1;
        this.getPageData();
    }
    goToDetails(id) {
        this.router.navigate([`/purchaser-admin/page-details/${this.bookId}/${this.collectionId}/${id}`]);
    }
    goBack() {
        this.router.navigate([`/purchaser-admin/book-details/${this.bookId}`]);
    }
    navigateToPagesApp() {
        let url = `/apps/pages/index.html`;
        window.open(url, '_blank');
    }
}
