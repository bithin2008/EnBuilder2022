import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-units-deals',
    templateUrl: './units-deals.component.html',
    styleUrls: ['./units-deals.component.css']
})
export class UnitsDealsComponent implements OnInit {
    unitList: any[] = [];
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_created';
    formDetails: any = {};
    paginationObj: any = {};
    measureUnits: any[] = [];
    filterForm: any = {
        searchText: '',
        project_id: '',
        model_id: [],
        floor_legal: [],
        beds: [],
        baths: [],
        status: [],
        views: [],
        media: [],
        flex: [],
        ceiling: [],
        type: [],
        collection: [],
        design_studio: [],
        bicycle_selection: [],
        parking_selection: [],
        locker_selection: [],
        cols: []
    };
    floorList: any[] = [];
    selectedAll: boolean = false;
    isClear: boolean = false;
    isBulkAssign: boolean = false;
    autosearchText: any = '';
    ceilingFields: any[] = [
        { _id: 9, value: 9 },
        { _id: 10, value: 10 },
        { _id: 11, value: 11 },
        { _id: 12, value: 12 },
        { _id: 13, value: 13 },
        { _id: 14, value: 14 },
        { _id: 15, value: 15 }
    ];
    numberFields: any[] = [
        { _id: 1, value: 1 },
        { _id: 2, value: 2 },
        { _id: 3, value: 3 },
        { _id: 4, value: 4 },
        { _id: 5, value: 5 }
    ];
    dropdownSettings: any;
    statusDropdownSettings: any;
    modelDropdownSettings: any;
    reverse: boolean = true;
    modalRef: BsModalRef;
    allProjectList: any[] = [];
    filterModelList: any[] = [];
    filterViewsList: any[] = [];
    unitColumns: any[] = [];
    allUnitColumns: any[] = [
        { _id: 'sales_price', value: 'Sale Price' },
        { _id: 'floor_legal', value: 'Legal Floor' },
        { _id: 'floor_marketing', value: 'Marketing Floor' },
        { _id: 'unit_no_legal', value: 'Legal Unit' },
        { _id: 'bed', value: 'Beds' },
        { _id: 'bath', value: 'Baths' },
        { _id: 'den', value: 'Den' },
        { _id: 'flex', value: 'Media' },
        { _id: 'area', value: 'Area' },
        { _id: 'outdoor_area', value: 'Outdoor' },
        { _id: 'ceiling', value: 'Ceiling' },
        { _id: 'is_parking_eligible', value: 'Parking' },
        { _id: 'is_locker_eligible', value: 'Locker' },
        { _id: 'is_bicycle_eligible', value: 'Bicycle' }
    ];
    unitStatus: any[] = [
        { _id: 'AVAILABLE', value: 'AVAILABLE' },
        { _id: 'ASSIGNED', value: 'ASSIGNED' },
        // { _id: 'OUTDOOR', value: 'OUTDOOR' },
        { _id: 'BROKER ALLOCATED', value: 'BROKER ALLOCATED' },
        { _id: 'RESERVED', value: 'RESERVED' },
        { _id: 'CORPORATE HOLD', value: 'CORPORATE HOLD' },
        { _id: 'MARKETING HOLD', value: 'MARKETING HOLD' },
        { _id: 'SALES HOLD', value: 'SALES HOLD' },
        { _id: 'SOLD', value: 'SOLD' },
    ];
    statusList: any = ['NOT STARTED', 'OPEN', 'SUBMITTED', 'SELECTION FINAL', 'WAITING FOR PAYMENT', 'COMPLETED', 'CANCELLED - BY CUSTOMER', 'CANCELLED - NO PAYMENT']
    collectionOptions: any[] = [];
    typeOptions: any[] = [];
    colspanVal: any = 12;
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.getSavedFilterdata();

        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];

        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };

        this.statusDropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            itemsShowLimit: 2,
            allowSearchFilter: true
        };

        this.modelDropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            itemsShowLimit: 2,
            allowSearchFilter: true
        }
    }

    getSavedFilterdata() {

        let filterData: any = localStorage.getItem('purchaserUnitsFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.project_id) {
                this.filterForm.project_id = filterData.project_id;
            }
            if (filterData.model_id) {
                this.filterForm.model_id = filterData.model_id;
            }
            if (filterData.beds) {
                this.filterForm.beds = filterData.beds;
            }
            if (filterData.baths) {
                this.filterForm.baths = filterData.baths;
            }
            if (filterData.media) {
                this.filterForm.media = filterData.media;
            }
            if (filterData.flex) {
                this.filterForm.flex = filterData.flex;
            }
            if (filterData.ceiling) {
                this.filterForm.ceiling = filterData.ceiling;
            }
            if (filterData.status) {
                this.filterForm.status = filterData.status;
            }
            if (filterData.floor_legal) {
                this.filterForm.floor_legal = filterData.floor_legal;
            }
            if (filterData.views) {
                this.filterForm.views = filterData.views;
            }
            if (filterData.design_studio) {
                this.filterForm.design_studio = filterData.design_studio;
            }
            if (filterData.bicycle_selection) {
                this.filterForm.bicycle_selection = filterData.bicycle_selection;
            }
            if (filterData.parking_selection) {
                this.filterForm.parking_selection = filterData.parking_selection;
            }
            if (filterData.locker_selection) {
                this.filterForm.locker_selection = filterData.locker_selection;
            }
            if (filterData.page) {
                this.page = filterData.page;
            }
            if (filterData.pageSize) {
                this.pageSize = filterData.pageSize;
            }
            if (filterData.sortby) {
                this.sortedtby = filterData.sortby;
            }
            if (filterData.sortOrder) {
                this.sortOrder = filterData.sortOrder;
            }
            if (filterData.type) {
                this.filterForm.type = filterData.type;
            }
            // if (filterData.cols) {
            //     this.filterForm.cols = filterData.cols;
            // }
            if (filterData.collection) {
                this.filterForm.collection = filterData.collection;
            }
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.showOrHideCols();
        this.getAllProjectList();
        this.getUnitList();
        this.getOptionsTypeList();
        this.getOptionsCollectionList();
        this.getModelsList();
    }

    showOrHideCols() {
        this.unitColumns = (this.filterForm.cols && this.filterForm.cols.length > 0) ? this.filterForm.cols : [];
        this.saveFilter();
        this.colspanVal = this.colspanVal + this.unitColumns.length;
    }

    getAllProjectList() {
        this.allProjectList = [];
        this.spinnerService.show();
        let url = `purchaser-portal/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.allProjectList = response.results;
                    let selectedProject = this.allProjectList.find(o => o._id == this.filterForm.project_id);
                    if (selectedProject) {
                        this.filterViewsList = selectedProject.views ? selectedProject.views.length > 0 ? selectedProject.views : [] : []
                        this.getFloorList(selectedProject.no_of_floors ? selectedProject.no_of_floors : 0);
                    }
                    else {
                        this.floorList = this.numberFields;
                    }

                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getOptionsTypeList() {
        let url = `purchaser-portal/options-of-model-types`;
        if (this.filterForm.project_id) {
            url = url + `?project_id=${this.filterForm.project_id}`;
        }
        this.typeOptions = [];
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (response.results && response.results.length > 0) {
                    response.results.forEach(element => {
                        if (element && element != '') {
                            this.typeOptions.push(element);
                        }
                    });
                }
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    projectFilterChange() {
        this.page = 1;
        this.filterForm.views = [];
        this.filterForm.model_id = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        if (this.filterForm.project_id) {
            this.filterForm.floor_legal = [];
            let projectFilterData = this.allProjectList.find((element) => element._id == this.filterForm.project_id);
            if (projectFilterData) {
                this.filterViewsList = projectFilterData ? projectFilterData.views ? projectFilterData.views : [] : [];
                this.getFloorList(projectFilterData.no_of_floors ? projectFilterData.no_of_floors : 0);
            }
            else {
                this.floorList = this.numberFields;
            }
            // this.getFilterModelList(this.filterForm.project_id);
            this.getModelsList();
            this.getOptionsTypeList();
            this.getOptionsCollectionList();
        }
        else {
            this.filterViewsList = [];
            this.filterModelList = [];
            this.typeOptions = [];
            this.collectionOptions = [];
        }
        this.getUnitList();

    }

    getFloorList(no_of_floors) {
        this.floorList = [];
        if (no_of_floors && no_of_floors > 0) {
            for (let i = 1; i <= no_of_floors; i++) {
                let obj = {
                    _id: i,
                    value: i
                }
                this.floorList.push(obj);
            }
        }
        else {
            this.floorList = this.numberFields;
        }
    }

    getUnitList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `purchaser-portal/units-list`;
        let data: any = {};
        if (this.page) {
            data.page = this.page;
        }
        if (this.pageSize) {
            data.pageSize = this.pageSize;
        }
        if (this.sortedtby) {
            data.sortBy = this.sortedtby;
            data.sortOrder = this.sortOrder;
        }
        if (this.filterForm.searchText) {
            data.searchText = this.filterForm.searchText;
        }
        if (this.filterForm.project_id) {
            data.project_id = this.filterForm.project_id;
        }
        if (this.filterForm.beds.length > 0) {
            const values = this.filterForm.beds.map((ele) => ele.value);
            const valueString = values.join();
            data.bed = valueString;
        }

        if (this.filterForm.baths.length > 0) {
            const values = this.filterForm.baths.map((ele) => ele.value);
            const valueString = values.join();
            data.bath = valueString;
        }
        if (this.filterForm.media.length > 0) {
            const values = this.filterForm.media.map((ele) => ele.value);
            const valueString = values.join();
            data.media = valueString;
        }
        if (this.filterForm.flex.length > 0) {
            const values = this.filterForm.flex.map((ele) => ele.value);
            const valueString = values.join();
            data.flex = valueString;
        }
        if (this.filterForm.ceiling.length > 0) {
            const values = this.filterForm.ceiling.map((ele) => ele.value);
            const valueString = values.join();
            data.ceiling = valueString;
        }

        if (this.filterForm.model_id.length > 0) {
            const values = this.filterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            data.model_id = valueString;
        }
        // if (this.filterForm.floor.length > 0) {
        //     const values = this.filterForm.floor.map((ele) => ele.value);
        //     const valueString = values.join();
        // }
        if (this.filterForm.floor_legal.length > 0) {
            const values = this.filterForm.floor_legal.map((ele) => ele._id);
            const valueString = values.join();
            data.floor_legal = valueString;
        }
        if (this.filterForm.views.length > 0) {
            const values = this.filterForm.views.map((ele) => ele);
            const valueString = values.join();
            data.views = valueString;
        }
        if (this.filterForm.status.length > 0) {
            const values = this.filterForm.status.map((ele) => ele.value);
            const valueString = values.join();
            data.status = valueString;
        }
        if (this.filterForm.collection.length > 0) {
            const values = this.filterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }
        if (this.filterForm.type.length > 0) {
            const values = this.filterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.filterForm.design_studio.length > 0) {
            const values = this.filterForm.design_studio.map((ele) => ele);
            const valueString = values.join();
            data.design_studio = valueString;
        }
        if (this.filterForm.locker_selection.length > 0) {
            const values = this.filterForm.locker_selection.map((ele) => ele);
            const valueString = values.join();
            data.locker_selection = valueString;
        }
        if (this.filterForm.parking_selection.length > 0) {
            const values = this.filterForm.parking_selection.map((ele) => ele);
            const valueString = values.join();
            data.parking_selection = valueString;
        }
        if (this.filterForm.bicycle_selection.length > 0) {
            const values = this.filterForm.bicycle_selection.map((ele) => ele);
            const valueString = values.join();
            data.bicycle_selection = valueString;
        }
        // console.log('this.filterForm', this.filterForm);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitList = response.results && response.results.rows ? response.results.rows : [];
                    this.unitList.forEach((ele) => {
                        ele.is_select = false;
                        if (ele.deal_id && ele.deal && ele.deal.length>0) {
                            ele.enable_bicycle_selection = ele.deal[0].portal ? ele.deal[0].portal.enable_bicycle_selection : false;
                            ele.enable_locker_selection = ele.deal[0].portal ? ele.deal[0].portal.enable_locker_selection : false;
                            ele.enable_parking_selection = ele.deal[0].portal ? ele.deal[0].portal.enable_parking_selection : false;
                            ele.enable_design_studio = ele.deal[0].portal ? ele.deal[0].portal.enable_design_studio : false;
                            ele.enable_layout_customization = ele.deal[0].portal ? ele.deal[0].portal.enable_layout_customization : false;
                            // ele.enable_personalization = ele.deal[0].portal ? ele.deal[0].portal.enable_personalization : false;
                            // ele.enable_color_collection = ele.deal[0].portal ? ele.deal[0].portal.enable_color_collection : false;
                            // ele.enable_customization = ele.deal[0].portal ? ele.deal[0].portal.enable_customization : false;

                        }

                        let packageRecords = ele.hasOwnProperty('packages') ? ele.packages : [];
                        ele.total_package_price = 0;
                        packageRecords.forEach(record => {
                            if (record.price) {
                                ele.total_package_price = ele.total_package_price + record.price;
                            }
                        })
                        // }
                        // else if (type == 'PERSONALIZATION_OPTION') {
                        let optionRecords = ele.hasOwnProperty('personalization_options') ? ele.personalization_options : [];
                        ele.total_option_price = 0;
                        optionRecords.forEach(record => {
                            if (record.price) {
                                ele.total_option_price = ele.total_option_price + record.price;
                            }
                        })

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
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            console.log('error', error);
        });

    }

    ///// Filters /////
    selectAll() {
        for (var i = 0; i < this.unitList.length; i++) {
            if (this.unitList[i].deal_id) {
                this.unitList[i].is_select = this.selectedAll;
            }
        }
        this.onChangeAssignCheckbox();
    }

    onItemSelect(type?) {
        this.page = 1;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        this.getUnitList();
    }
    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        this.getUnitList();
    }
    onViewsSelect(type, event) {
        this.filterForm[type] = event;
    }

    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        this.getUnitList();
    }


    onDeSelectAllCols(type, event) {
        this.filterForm[type] = event;
        this.showOrHideCols();
    }

    onSelectAllCols(type, event) {
        this.filterForm[type] = event;
        this.showOrHideCols();
    }

    onItemSelectCol() {
        this.showOrHideCols();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getUnitList();
    }

    
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.filterForm.project_id = '';
        this.filterForm.model_id = [];
        this.filterForm.status = [];
        this.filterForm.beds = [];
        this.filterForm.baths = [];
        this.filterForm.floor_legal = [];
        this.filterForm.views = [];
        this.filterForm.media = [];
        this.filterForm.flex = [];
        this.filterForm.ceiling = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        this.filterForm.design_studio = [],
            this.filterForm.bicycle_selection = [],
            this.filterForm.parking_selection = [],
            this.filterForm.locker_selection = [],

            // this.filterForm.cols = [];
            this.getUnitList();
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getUnitList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            project_id: this.filterForm.project_id,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            model_id: this.filterForm.model_id,
            beds: this.filterForm.beds,
            baths: this.filterForm.baths,
            media: this.filterForm.media,
            flex: this.filterForm.flex,
            ceiling: this.filterForm.ceiling,
            status: this.filterForm.status,
            floor_legal: this.filterForm.floor_legal,
            views: this.filterForm.views,
            collection: this.filterForm.collection,
            type: this.filterForm.type,
            design_studio: this.filterForm.design_studio,
            bicycle_selection: this.filterForm.bicycle_selection,
            parking_selection: this.filterForm.parking_selection,
            locker_selection: this.filterForm.locker_selection,
            // cols: this.filterForm.cols,
        }
        localStorage.setItem('purchaserUnitsFilterData', JSON.stringify(data));
    }

    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getUnitList();
    }

    setPageSize() {
        this.page = 1;
        this.getUnitList();
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
        this.getUnitList();
    }

    onChangeAssignCheckbox(event?) {
        event ? event.stopPropagation() : true;
        let records = this.unitList.filter(element => element.is_select == true);
        if (records.length > 0) {
            this.isBulkAssign = true;
        }
        else {
            this.isBulkAssign = false;
        }
    }

    openUnitDetailsPage(item) {
        this.router.navigate(['purchaser-admin/unit-details/' + item._id]);
    }

    navigateToDealDetails(id) {
        let url = `#/sales/deals/${id}`;
        window.open(url, '_blank');
    }

    onDesignStudioChange(item, event) {
        event.preventDefault();
        this.confirmationDialogService.confirm('Confirmation', `Do you want to update the status of design studio?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {
                        enable_parking_selection: item.enable_parking_selection,
                        enable_bicycle_selection: item.enable_bicycle_selection,
                        enable_locker_selection: item.enable_locker_selection,
                        enable_design_studio: !item.enable_design_studio,
                        enable_layout_customization: item.enable_layout_customization,
                        // enable_customization: item.enable_customization,
                        // enable_color_collection: item.enable_color_collection,
                        // enable_package_selection: item.enable_package_selection,
                        // enable_personalization: item.enable_personalization
                    };
                    data.deals = [];
                    data.deals.push(item.deal_id);
                    this.callUpdateSelectionAPI(data);
                }
            }).catch(() => console.log('User dismissed the dialog '));

    }

    onEnableParkingChange(item, event) {
        event.preventDefault();
        this.confirmationDialogService.confirm('Confirmation', `Do you want to update the status of parking selection ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {
                        enable_parking_selection: !item.enable_parking_selection,
                        enable_bicycle_selection: item.enable_bicycle_selection,
                        enable_design_studio: item.enable_design_studio,
                        enable_locker_selection: item.enable_locker_selection,
                        enable_layout_customization: item.enable_layout_customization,
                        // enable_customization: item.enable_customization,
                        // enable_color_collection: item.enable_color_collection,
                        // enable_package_selection: item.enable_package_selection,
                        // enable_personalization: item.enable_personalization
                    };
                    data.deals = [];
                    data.deals.push(item.deal_id);
                    this.callUpdateSelectionAPI(data);
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    onEnableBicycleChange(item, event) {
        event.preventDefault();
        this.confirmationDialogService.confirm('Confirmation', `Do you want to update the status of bicycle parking selection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {
                        enable_parking_selection: item.enable_parking_selection,
                        enable_bicycle_selection: !item.enable_bicycle_selection,
                        enable_design_studio: item.enable_design_studio,
                        enable_locker_selection: item.enable_locker_selection,
                        enable_layout_customization: item.enable_layout_customization,
                        // enable_color_collection: item.enable_color_collection,
                        // enable_customization: item.enable_customization,
                        // enable_package_selection: item.enable_package_selection,
                        // enable_personalization: item.enable_personalization
                    };
                    data.deals = [];
                    data.deals.push(item.deal_id);
                    this.callUpdateSelectionAPI(data);
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    onEnableLockerChange(item, event) {
        event.preventDefault();
        this.confirmationDialogService.confirm('Confirmation', `Do you want to update the status of locker selection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {
                        enable_parking_selection: item.enable_parking_selection,
                        enable_bicycle_selection: item.enable_bicycle_selection,
                        enable_design_studio: item.enable_design_studio,
                        enable_locker_selection: !item.enable_locker_selection,
                        enable_layout_customization: item.enable_layout_customization,
                        // enable_customization: item.enable_customization,
                        // enable_color_collection: item.enable_color_collection,
                        // enable_package_selection: item.enable_package_selection,
                        // enable_personalization: item.enable_personalization
                    };
                    data.deals = [];
                    data.deals.push(item.deal_id);
                    this.callUpdateSelectionAPI(data);
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }


    getOptionsCollectionList() {
        let url = `purchaser-portal/options-of-model-collections?project_id=${this.filterForm.project_id}`;
        this.collectionOptions = [];
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (response.results && response.results.length > 0) {
                    response.results.forEach(element => {
                        if (element && element != '') {
                            this.collectionOptions.push(element);
                        }
                    });
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getModelsList() {
        let url = `inventories/options-of-models`;
        let data: any = {};
        data.project_id = this.filterForm.project_id;
        if (this.filterForm.type.length > 0) {
            const values = this.filterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.filterForm.collection.length > 0) {
            const values = this.filterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }

        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.filterModelList = response.results ? response.results : [];
                this.filterModelList.length == 0 ? this.filterForm.model_id = [] : true;
            }
        }, (error) => {
            console.log('error', error);
        });
    }


    onEnableLayoutCustomizationChange(item, event){
        event.preventDefault();
        this.confirmationDialogService.confirm('Confirmation', `Do you want to update the status of layout customization?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {
                        enable_parking_selection: item.enable_parking_selection,
                        enable_bicycle_selection: item.enable_bicycle_selection,
                        enable_design_studio: item.enable_design_studio,
                        enable_locker_selection: item.enable_locker_selection,
                        enable_layout_customization: !item.enable_layout_customization,
                    };
                    data.deals = [];
                    data.deals.push(item.deal_id);
                    this.callUpdateSelectionAPI(data);
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    callUpdateSelectionAPI(data) {
        this.spinnerService.show();
        let url = `purchaser-portal/purchaser-portal-options`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getUnitList();
                    this.toastr.success(response.message, 'Success');
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openAssignDetailModal(template: TemplateRef<any>) {
        this.formDetails = {
            enable_design_studio: false,
            enable_bicycle_selection: false,
            enable_locker_selection: false,
            enable_parking_selection: false,
            enable_layout_customization:false,
            // enable_package_selection: false,
            // enable_color_collection: false,
            // enable_customization: false,
            // enable_personalization: false
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }
    
    updateUnit() {
        let selectedDeals = this.unitList.filter((element) => element.deal_id && element.is_select);
        let data: any = { ...this.formDetails };
        data.deals = selectedDeals.map((deal) => deal.deal_id);
        let url = `purchaser-portal/purchaser-portal-options`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.filterForm.searchText = '';
                    this.isClear = false;
                    this.getUnitList();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
}
