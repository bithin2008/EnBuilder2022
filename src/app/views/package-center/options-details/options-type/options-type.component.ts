import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-options-type',
    templateUrl: './options-type.component.html',
    styleUrls: ['./options-type.component.css']
})
export class OptionsTypeComponent implements OnInit {
    @Input() optionDetailsObj: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() optionId: string;
    formDetails: any = {};
    modalRef: BsModalRef;
    optionsList: any[] = [];
    incompatibleOptionsList: any[] = [];
    soldWithOptionsList: any[] = [];
    dropdownSettings: any = {};
    should_sold_with: boolean = false;
    incompatible_options: boolean = false;
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

    getOptionsList(type) {
        this.optionsList = [];
        this.spinnerService.show();
        let url = `package-center/options?project_id=${this.optionDetailsObj.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            const only_sold_with_options = this.optionDetailsObj.only_sold_with_options ? this.optionDetailsObj.only_sold_with_options.map(ele => ele._id) : [];
            const incompatible_options = this.optionDetailsObj.incompatible_options ? this.optionDetailsObj.incompatible_options.map(ele => ele._id) : [];

            if (response.status == 1) {
                if (type == 'only_sold_with_options') {

                    this.soldWithOptionsList = [];
                    response.results.forEach(element => {
                        // if (element._id != this.optionId && only_sold_with_options.indexOf(element._id) == -1 && incompatible_options.indexOf(element._id) == -1) {
                        if (element._id != this.optionId && incompatible_options.indexOf(element._id) == -1) {
                            this.soldWithOptionsList.push(element);
                        }
                    });
                }
                else if (type == 'incompatible_options') {
                    this.incompatibleOptionsList = [];
                    response.results.forEach(element => {
                        // if (element._id != this.optionId && only_sold_with_options.indexOf(element._id) == -1 && incompatible_options.indexOf(element._id) == -1) {                        
                        if (element._id != this.optionId && only_sold_with_options.indexOf(element._id) == -1) {
                            this.incompatibleOptionsList.push(element);
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

    onChangeSoldWithCheckbox() {

    }

    openAddSoldWithOption(template: TemplateRef<any>) {
        this.getOptionsList('only_sold_with_options');
        this.formDetails.only_sold_with_options = (this.optionDetailsObj.only_sold_with_options && this.optionDetailsObj.only_sold_with_options.length > 0) ? this.optionDetailsObj.only_sold_with_options : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    deleteSoldWithOption(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.optionDetailsObj.only_sold_with_options.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.only_sold_with_options = shallowCopy ? shallowCopy : [];
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

    openAddIncompatibleOptions(template: TemplateRef<any>) {
        this.getOptionsList('incompatible_options');
        this.formDetails.incompatible_options = (this.optionDetailsObj.incompatible_options && this.optionDetailsObj.incompatible_options.length > 0) ? this.optionDetailsObj.incompatible_options : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    deleteIncompatibleOptions(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Incompatible Option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.optionDetailsObj.incompatible_options.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.incompatible_options = shallowCopy ? shallowCopy : [];
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

    addSoldWithOption() {
        if (this.formDetails.only_sold_with_options.length == 0) {
            this.toastr.warning('Please select option', 'Warning');
            return;
        }
        let data: any = {};
        data.only_sold_with_options = this.formDetails.only_sold_with_options ? this.formDetails.only_sold_with_options : [];
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

    addIncompatibleOptions() {
        if (this.formDetails.incompatible_options.length == 0) {
            this.toastr.warning('Please select incompatible option', 'Warning');
            return;
        }
        let data: any = {};
        data.incompatible_options = this.formDetails.incompatible_options ? this.formDetails.incompatible_options : [];
        console.log('data', data);
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
