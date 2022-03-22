import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-color-collection-packages',
    templateUrl: './packages.component.html',
    styleUrls: ['./packages.component.css']
})
export class ColorCollectionPackagesComponent implements OnInit {
    @Input() collectionDetails: any = {};
    // @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() collectionId: string;
    baseUrl = environment.BASE_URL;
    packageList: any = [];
    formDetails: any = {};
    paginationObj: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';

    constructor(private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService) { }

    ngOnInit(): void {
        this.getCollectionList();
    }

    getCollectionList() {
        this.spinnerService.show();
        let url = `package-center/packages?collection_id=${this.collectionId}&page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        // if (this.collectionDetails.project_id) {
        //     url = url + `&project_id=${this.collectionDetails.project_id}`;
        // }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.packageList = response.results;
                if (response.pagination)
                    this.paginationObj = response.pagination;
                else
                    this.paginationObj = {
                        total: 0
                    };
            } else {
                this.paginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    navigatePacakge(item) {
        event.stopPropagation();
        let url = `#/package-center/packages/${item._id}`;
        window.open(url, '_blank');

    }

    doPaginationWise(page) {
        this.page = page;
        this.getCollectionList();
    }

    setPageSize() {
        this.page = 1;
        this.getCollectionList();
    }
}
