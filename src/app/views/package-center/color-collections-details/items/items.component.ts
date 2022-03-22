import { Component, OnInit, TemplateRef, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit, OnChanges {
    @Input() collectionDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    baseUrl = environment.BASE_URL;
    @Input() collectionId: string;
    isEdit: boolean = false;
    formDetails: any = {};
    modalRef: BsModalRef;
    constructor(private modalService: BsModalService,
        private toastr: ToastrService,
        public _activatedRoute: ActivatedRoute,
        private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {

    }
    ngOnChanges() {
        this.getCategoryList();
    }

    getCategoryList() {
        // console.log('this.collectionDetails', this.collectionDetails);
        if (this.collectionDetails && !this.collectionDetails.hasOwnProperty('item_categories')) {
            this.collectionDetails.item_categories = [];
        }
        else {
            //code if item_categories present
        }
    }

    openAddCategoryModal(template: TemplateRef<any>) {
        this.formDetails = {
            name: ''
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    addCategory() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter category name', 'Warning');
            return;
        }
        let duplicate = false;
        this.collectionDetails.item_categories.forEach((item: any) => {
            if (item.name == this.formDetails.name) {
                duplicate = true;
            }
        });
        if (duplicate) {
            this.toastr.warning('This category already exist !', 'Warning');
            return;
        }
        // CHECK item_categories EXIST IN RECORD AND HANDLE LOGIC
        let itemCategories: any[] = [];
        // console.log('this.collectionDetails', this.collectionDetails);
        itemCategories = [...this.collectionDetails.item_categories];
        if (itemCategories) {
            let category = {
                name: this.formDetails.name,
                items: []
            }
            itemCategories.push(category);
        }
        const data: any = {};
        data.item_categories = itemCategories;
        const url = `package-center/color-collections?_id=${this.collectionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getColorCollectionDetails() {
        this.getDetailsEvent.emit(true);
    }

    openAddItemModal(template: TemplateRef<any>, index) {
        this.isEdit = false;
        this.formDetails = {
            categoryIndex: index,
            name: '',
            type: '',
            selection: ''
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    addItemByCategory() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.formDetails.type || !this.formDetails.type.trim()) {
            this.toastr.warning('Please enter type', 'Warning');
            return;
        }
        let duplicate = false;
        this.collectionDetails.item_categories[this.formDetails.categoryIndex].items.forEach((item: any) => {
            if (item.name == this.formDetails.name) {
                duplicate = true;
            }
        });
        if (duplicate) {
            this.toastr.warning('This category item already exist !', 'Warning');
            return;
        }
        let itemCategories: any[] = [];
        itemCategories = [...this.collectionDetails.item_categories];
        let selectedCategory = itemCategories[this.formDetails.categoryIndex];
        if (selectedCategory && selectedCategory.items) {
            let item = { ...this.formDetails };
            delete item.categoryIndex;
            selectedCategory.items.push(item);
            itemCategories[this.formDetails.categoryIndex] = selectedCategory
        }
        let data: any = {};
        data.item_categories = itemCategories;
        let url = `package-center/color-collections?_id=${this.collectionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }


    openEditItemModal(template: TemplateRef<any>, categoryIndex, item, itemIndex) {
        this.isEdit = true;
        this.formDetails = { ...item };
        this.formDetails.categoryIndex = categoryIndex;
        this.formDetails.itemIndex = itemIndex,
            this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    editItemByCategory() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.formDetails.type || !this.formDetails.type.trim()) {
            this.toastr.warning('Please enter type', 'Warning');
            return;
        }
        let itemCategories: any[] = [];
        itemCategories = [...this.collectionDetails.item_categories];
        let selectedCategory = itemCategories[this.formDetails.categoryIndex];
        if (selectedCategory && selectedCategory.items) {
            let item = { ...this.formDetails };
            delete item.categoryIndex;
            delete item.itemIndex;
            selectedCategory.items[this.formDetails.itemIndex] = item;
            itemCategories[this.formDetails.categoryIndex] = selectedCategory
        }
        const data: any = {};
        data.item_categories = itemCategories;
        const url = `package-center/color-collections?_id=${this.collectionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    
    deleteCategoryItem(item, categoryIndex, itemIndex) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let itemCategories: any[] = [];
                    itemCategories = [...this.collectionDetails.item_categories];
                    let selectedCategory = itemCategories[categoryIndex];
                    if (selectedCategory && selectedCategory.items) {
                        selectedCategory.items.splice(itemIndex, 1);
                        itemCategories[categoryIndex] = selectedCategory
                    }
                    const data: any = {};
                    data.item_categories = itemCategories;
                    const url = `package-center/color-collections?_id=${this.collectionId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getColorCollectionDetails();
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

    deleteCategory(item, categoryIndex) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let itemCategories: any[] = [];
                    itemCategories = this.collectionDetails.item_categories;
                    if (itemCategories) {
                        itemCategories.splice(categoryIndex, 1);
                    }
                    const data: any = {};
                    data.item_categories = itemCategories;
                    const url = `package-center/color-collections?_id=${this.collectionId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getColorCollectionDetails();
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
}
