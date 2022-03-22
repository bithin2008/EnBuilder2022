import { Component, OnInit, Output, EventEmitter, Input, TemplateRef } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-package-collections',
    templateUrl: './package-collections.component.html',
    styleUrls: ['./package-collections.component.css']
})
export class PackageCollectionsComponent implements OnInit {
    @Input() packageDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() packageId: string;
    allCollectionList: any[] = [];
    selectedCollections: any[] = [];
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_created';
    reverse: boolean = true;
    isBulkDelete: boolean = false;
    selectedAll: boolean = false;
    selectedAllCollection: boolean = false;
    paginationObj: any = {};
    modalRef: BsModalRef;

    constructor(private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges(event) {
        this.selectedCollections = event.packageDetails.currentValue ? event.packageDetails.currentValue.collections ? event.packageDetails.currentValue.collections : [] : [];
        this.selectedCollections.forEach((element) => {
            element.is_selected = true;
            element.should_delete = false;
        });
        this.selectedAll = false;
    }
    openBulkAddModal(template: TemplateRef<any>) {
        this.allCollectionList = [];
        this.getCollectionList();
        this.selectedAllCollection = false;
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });
    }

    setOrder(value: string) {
        if (this.order === value) {
            this.reverse = !this.reverse;
        }
        this.order = value;
        this.sortedtby = value;
        if (this.reverse) {
            this.sortOrder = 'DESC';
        } else {
            this.sortOrder = 'ASC';
        }
        // this.getSelectedCollections();
    }

    getCollectionList() {
        // let url = `package-center/color-collections?_id=${this.packageId}&purpose=add&project_id=${this.packageDetails.project_id}`;
        let url = `package-center/color-collections?page=1&pageSize=200&project_id=${this.packageDetails.project_id}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                let collections: any[] = (this.packageDetails.collections && this.packageDetails.collections.length > 0) ? this.packageDetails.collections.map((ele) => ele.collection_id) : [];
                console.log('collections', collections);
                if (collections.length > 0) {
                    response.results.forEach((collection, index) => {
                        console.log('id', collection._id);

                        if (collections.indexOf(collection._id) == -1) {
                            this.allCollectionList.push(collection);
                        }
                    })
                }
                else {
                    this.allCollectionList = response.results;
                }

                this.allCollectionList.forEach((element) => {
                    element.is_selected = false;
                })
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
            console.log('error', error);
        });

    }

    selectAll() {
        for (var i = 0; i < this.selectedCollections.length; i++) {
            this.selectedCollections[i].should_delete = this.selectedAll;
        }
        this.onChangeDeleteCheckbox();
    }

    selectAllModel() {
        for (var i = 0; i < this.allCollectionList.length; i++) {
            this.allCollectionList[i].is_selected = this.selectedAllCollection;
        }
    }

    onChangeDeleteCheckbox() {
        let records = this.selectedCollections.filter(element => element.should_delete == true);
        if (records.length > 0) {
            this.isBulkDelete = true;
        }
        else {
            this.isBulkDelete = false;
            this.selectedAll = false;
        }
    }

    deleteCollection(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} collection ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let existingCollections = this.packageDetails.collections;
                    existingCollections.splice(index, 1);
                    const data: any = {};
                    data._id = this.packageId;
                    data.collections = existingCollections;
                    const url = `package-center/packages`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getPackageDetails();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    deleteBulkCollections() {
        let selectedRecords = this.selectedCollections.filter(element => element.should_delete == true);
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${selectedRecords.length} collection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let finalList: any[] = [];
                    this.selectedCollections.forEach((element, index) => {
                        if (element.should_delete == false) {
                            finalList.push(element);
                        }
                    });
                    const data: any = {};
                    data._id = this.packageId;
                    data.collections = finalList;
                    const url = `package-center/packages`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.isBulkDelete = false;
                            this.selectedAll = false;
                            this.getPackageDetails();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    addBulkCollections() {
        let selectedElements = this.allCollectionList.filter(element => element.is_selected);
        if (selectedElements.length == 0) {
            this.toastr.error('Please select collections', 'Error');
            return;
        }
        //format the selectedElements
        let formattedCollections: any[] = [];
        selectedElements.forEach((ele) => {
            let obj: any = {};
            obj.collection_id = ele._id;
            obj.name = ele.name;
            obj.cost = ele.cost;
            obj.price = ele.price;
            formattedCollections.push(obj);
        });
        const data: any = {};
        data._id = this.packageId;
        data.collections = [...formattedCollections, ...this.selectedCollections];
        let url = `package-center/packages`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }

    getPackageDetails() {
        this.getDetailsEvent.emit(true);
    }


    doPaginationWise(page) {
        this.page = page;
        // this.getSelectedCollections();
    }

    setPageSize() {
        this.page = 1;
        // this.getSelectedCollections();
    }

}
