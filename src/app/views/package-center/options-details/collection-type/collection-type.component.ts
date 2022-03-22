import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-collection-type',
    templateUrl: './collection-type.component.html',
    styleUrls: ['./collection-type.component.css']
})
export class CollectionTypeComponent implements OnInit {
    @Input() optionDetailsObj: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() optionId: string;
    formDetails: any = {};
    modalRef: BsModalRef;
    collectionList: any[] = [];
    incompatibleCollectionList: any[] = [];
    soldWithCollectionList: any[] = [];
    dropdownSettings: any = {};
    should_sold_with: boolean = false;
    incompatible_collections: boolean = false;

    constructor(private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private router: Router,
        private modalService: BsModalService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            // itemsShowLimit: 1,
            allowSearchFilter: true
        };
    }

    getCollectionList(type) {
        this.collectionList = [];
        this.spinnerService.show();
        let url = `package-center/color-collections?project_id=${this.optionDetailsObj.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            const only_sold_with_collections = this.optionDetailsObj.only_sold_with_collections ? this.optionDetailsObj.only_sold_with_collections.map(ele => ele._id) : [];
            const incompatible_collections = this.optionDetailsObj.incompatible_collections ? this.optionDetailsObj.incompatible_collections.map(ele => ele._id) : [];

            if (response.status == 1) {
                if (type == 'only_sold_with_collections') {

                    this.soldWithCollectionList = [];
                    response.results.forEach(element => {
                        // if (element._id != this.optionId && only_sold_with_collections.indexOf(element._id) == -1 && incompatible_collections.indexOf(element._id) == -1) {
                        if (element._id != this.optionId && incompatible_collections.indexOf(element._id) == -1) {
                            this.soldWithCollectionList.push(element);
                        }
                    });
                }
                else if (type == 'incompatible_collections') {
                    this.incompatibleCollectionList = [];
                    response.results.forEach(element => {
                        // if (element._id != this.optionId && only_sold_with_collections.indexOf(element._id) == -1 && incompatible_collections.indexOf(element._id) == -1) {                        
                        if (element._id != this.optionId && only_sold_with_collections.indexOf(element._id) == -1) {
                            this.incompatibleCollectionList.push(element);
                        }
                    });
                }
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    openAddSoldWithCollections(template: TemplateRef<any>) {
        this.getCollectionList('only_sold_with_collections');
        this.formDetails.only_sold_with_collections = (this.optionDetailsObj.only_sold_with_collections && this.optionDetailsObj.only_sold_with_collections.length > 0) ? this.optionDetailsObj.only_sold_with_collections : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    deleteSoldWithCollections(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Collection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.optionDetailsObj.only_sold_with_collections.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.only_sold_with_collections = shallowCopy ? shallowCopy : [];
                    let url = `package-center/options?_id=${this.optionId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getOptionDetails();
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

    openAddIncompatibleCollection(template: TemplateRef<any>) {
        this.getCollectionList('incompatible_collections');
        this.formDetails.incompatible_collections = (this.optionDetailsObj.incompatible_collections && this.optionDetailsObj.incompatible_collections.length > 0) ? this.optionDetailsObj.incompatible_collections : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    deleteIncompatibleCollections(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Incompatible Collection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.optionDetailsObj.incompatible_collections.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.incompatible_collections = shallowCopy ? shallowCopy : [];
                    let url = `package-center/options?_id=${this.optionId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getOptionDetails();
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

    addSoldWithCollection() {
        if (this.formDetails.only_sold_with_collections.length == 0) {
            this.toastr.warning('Please select package', 'Warning');
            return;
        }
        let data: any = {};
        data.only_sold_with_collections = this.formDetails.only_sold_with_collections ? this.formDetails.only_sold_with_collections : [];
        let url = `package-center/options?_id=${this.optionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getOptionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    addIncompatibleCollections() {
        if (this.formDetails.incompatible_collections.length == 0) {
            this.toastr.warning('Please select incompatible package', 'Warning');
            return;
        }
        let data: any = {};
        data.incompatible_collections = this.formDetails.incompatible_collections ? this.formDetails.incompatible_collections : [];
        let url = `package-center/options?_id=${this.optionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getOptionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onSelectDeSelectAll(type) {
        this.formDetails[type] = event;
    }

    onItemSelect(type) {
        this.formDetails[type] = event;
    }

    getOptionDetails() {
        this.getDetailsEvent.emit(true);
    }
}
