import { Component, OnInit, TemplateRef, Input, DoCheck, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { ExcelService } from '../../../services/excel.service';
import { concatAll } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { FormArray, FormGroup, FormBuilder, Validators, NgModel } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactModalComponent } from '../../sales/contact-modal/contact-modal.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
// import { FilterService } from "primeng/api";

@Component({
    selector: 'app-unit-list',
    templateUrl: './unit-list.component.html',
    styleUrls: ['./unit-list.component.css']
})
export class UnitListComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    @Input() user_id: String;
    @Input() returnUrl: String;
    paginationObj: any = {};
    modalRef: BsModalRef;
    openContactModalRef;
    formDetails: any = {
        views: []
    };
    collectionList: any[] = [];
    filterForm: any = {
        searchText: '',
        project_id: '',
        building_type:[],
        model_id: [],
        floor_legal: [],
        floor_marketing: [],
        beds: [],
        baths: [],
        status: [],
        views: [],
        spaces:[],
        media: [],
        flex: [],
        ceiling: [],
        collection: [],
        type: []
    };
    unitList: any = [];
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    projectList: any = [];
    modelList: any = [];
    builderList: any = [];
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_created';
    builderSelected: boolean = true;
    isClear: boolean = false;
    autosearchText: any = '';
    contactList: any = [];
    dropdownSettings = {};
    selectedAllUnit: boolean = false;
    projectListforBroker: any[] = [];
    ceilingFields: any[] = [
        { _id: 9, value: 9 },
        { _id: 10, value: 10 },
        { _id: 11, value: 11 },
        { _id: 12, value: 12 },
        { _id: 13, value: 13 },
        { _id: 14, value: 14 },
        { _id: 15, value: 15 }
    ];
    // numberFields: any[] = [
    //     { _id: 1, value: 1 },
    //     { _id: 2, value: 2 },
    //     { _id: 3, value: 3 },
    //     { _id: 4, value: 4 },
    //     { _id: 5, value: 5 }
    // ];
    numberFields: any[] = [];
    projectViews: any[] = [];
    projectSpaces: any[] = [];
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
    ]
    floorList: any = [] = [];
    filterModelList: any = [];
    reverse: boolean = true;
    importFileModal: any = {};
    projectListByBuilder: any = [] = [];
    fileDocument: any;
    importRecords: any = [];
    fileChoosed: boolean = false;
    measureUnits: any[] = [];
    lotTypeList: any[] = [];
    modelDropdownSettings: any;
    statusDropdownSettings: any;
    filterViewsList: any = [];
    filterSpaceList: any = [];
    importUnitsRef: BsModalRef;
    unitForm: FormGroup;
    allowImport: boolean = false;
    brokerList: any = [] = [];
    allUnitList: any[] = [];
    groupedBroker = [
        {
            label: "Brokers",
            value: "broker",
            items: []
        },
        {
            label: "Others",
            value: "other",
            items: []
        },

    ];
    modelListSuggestions: any[] = [];
    filteredGroups: any[] = [];
    filteredBrokerGroups: any[] = [];
    brokerSearchQuery: string = '';
    collectionOptions: any[] = [];
    typeOptions: any[] = [];
    isAvailableUnit1: boolean = false;
    isAvailableUnit2: boolean = false;
    isAvailableUnit3: boolean = false;
    selectedAll: boolean = false;
    isBulkAssign: boolean = false;
    buildingTypeList:any[]=[{
        _id:'condominium',
        value:'Condominium'
    },
    {
        _id:'townhouse',
        value:'Townhouse'
    },
    {
        _id:'semi-detached',
        value:'Semi-detached'
    },
    {
        _id:'detached',
        value:'Detached'
    }];
    addtionalDetails:any[]=[];
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private excelService: ExcelService,
        private cdk: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private ngModalService: NgbModal
        // private filterService: FilterService
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        // this.getAllProjectList();
        this.getUnitList();
        this.getLotTypeList();
        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];

        // this.getModelList();
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

        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            this.filterForm.model_id = [];
            this.filterForm.spaces = [];
            this.filterForm.views = [];
            this.filterForm.spaces=[];
            this.addtionalDetails=[];
            this.filterForm.building_type=[];
            this.filterForm.floor_legal = [];
            this.filterForm.floor_marketing = [];
            this.floorList=[];
    
            if (response) {
                this.filterForm.project_id = response._id;
                this.filterViewsList = response.views ? response.views.length > 0 ? response.views : [] : [];
                this.filterSpaceList = response.spaces ? response.spaces.length > 0 ? response.spaces : [] : [];
                this.addtionalDetails= response.additional_info ? response.additional_info : [];
                // [{"type":"condominium","total_units":100,"total_floors":12},{"type":"townhouse","total_buildings":30,"total_homes":30},{"type":"semi-detached","total_units":10,"total_homes":10},{"type":"detached","total_units":25,"total_floors":0}];
            }
            else {
                this.filterForm.project_id = '';
                this.floorList = this.numberFields;
            }
            this.projectFilterChange();
        });

        this.unitForm = this.formBuilder.group({
            units: this.formBuilder.array([])
        });

    }

    projectFilterChange() {
        this.filterForm.model_id = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        if (this.filterForm.project_id) {
            this.filterForm.floor_legal = [];
            this.filterForm.floor_marketing = [];
            // this.getFilterModelList(this.filterForm.project_id);
            this.getModelsList();
            this.getOptionsTypeList();
            this.getOptionsCollectionList();
        }
        else {
            this.filterModelList = [];
            this.typeOptions = [];
            this.collectionOptions = [];

        }
        this.getUnitList();
    }
    
    // statusFilterChange() {
    //     if (this.filterForm.status) {
    //         this.getUnitList();
    //     }
    // }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('inventoriesProjectData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData._id) {
                this.filterForm.project_id = projectFilterData._id;
                this.filterViewsList = projectFilterData.views ? projectFilterData.views.length > 0 ? projectFilterData.views : [] : [];
                this.filterSpaceList = projectFilterData.spaces ? projectFilterData.spaces.length > 0 ? projectFilterData.spaces : [] : [];
                this.projectViews = this.filterViewsList;
                this.projectSpaces =this.filterSpaceList;
                this.addtionalDetails= projectFilterData.additional_info ? projectFilterData.additional_info:[];
                // [{"type":"condominium","total_units":100,"total_floors":12},{"type":"townhouse","total_buildings":30,"total_homes":30},{"type":"semi-detached","total_units":10,"total_homes":10},{"type":"detached","total_units":25,"total_floors":0}];
                // console.log('filterViewsList', this.addtionalDetails);
            }
            else {
                this.floorList = this.numberFields;
            }
        }
        else {
            this.floorList = this.numberFields;
        }


        let filterData: any = localStorage.getItem('inventoriesUnitFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);

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
            if (filterData.floor_marketing) {
                this.filterForm.floor_marketing = filterData.floor_marketing;
            }
            if (filterData.views) {
                this.filterForm.views = filterData.views;
            }
            if (filterData.building_type) {
                this.filterForm.building_type = filterData.building_type;
                if(this.filterForm.building_type.length==1 && this.filterForm.building_type[0]._id=='condominium'){
                    let floors= this.addtionalDetails[0] ? this.addtionalDetails[0].total_floors :0;
                    this.getFloorList(floors);
                }
                else{
                    this.filterForm.floor_legal = [];
                    this.filterForm.floor_marketing = [];
                }
            }
            if(filterData.spaces){
                this.filterForm.spaces=filterData.spaces;
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
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            if (filterData.type) {
                this.filterForm.type = filterData.type;
            }
            if (filterData.collection) {
                this.filterForm.collection = filterData.collection;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getOptionsTypeList();
        this.getOptionsCollectionList();
        this.getModelsList();

    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    openUnitDetailsPage(item) {
        this.router.navigate(['inventories/unit/' + item._id]);
    }

    //// LOOKUP DATA ////
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

    getLotTypeList(project_id?) {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/lot-types?page=1&pageSize=100`;

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.lotTypeList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getOptionsTypeList() {
        let url = `inventories/options-of-model-types`;
        if (this.filterForm.project_id) {
            url = url + `?project_id=${this.filterForm.project_id}`;
        };
        this.spinnerService.show();
        this.typeOptions = [];
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

    getOptionsCollectionList() {
        let url = `inventories/options-of-model-collections`;
        if (this.filterForm.project_id) {
            url = url + `?project_id=${this.filterForm.project_id}`;
        };
        this.spinnerService.show();
        this.collectionOptions = [];
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

    getModelList(projectId: string) {
        this.spinnerService.show();
        let url = `inventories/models?page=1&pageSize=200&type=list`;
        if (projectId) {
            url = url + `&project_id=${projectId}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.modelList = response.results ? response.results : [];
                    // console.log(this.modelList);
                    this.filterCollections();
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
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

    getProjectList() {
        this.projectList = [];
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100`;
        if (this.formDetails.builder_id) {
            url = url + `&builder_id=${this.formDetails.builder_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectList = response.results ? response.results : [];
                    let selectedProject = this.projectList.find(o => o._id == this.formDetails.project_id);
                    this.projectViews = selectedProject.views ? selectedProject.views.length > 0 ? selectedProject.views : [] : []
                    this.projectSpaces = selectedProject.spaces ? selectedProject.spaces.length > 0 ? selectedProject.spaces : [] : []
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getBuilderList() {
        this.spinnerService.show();
        let url = `inventories/builders?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.builderList = response.results ? response.results : [];
                } else {
                    this.builderList = [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //// UNITS ///
    getUnitList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `inventories/units-list`;
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
        if (this.filterForm.model_id.length > 0) {
            const values = this.filterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            data.model_id = valueString;
        }
        if (this.filterForm.floor_legal.length > 0) {
            const values = this.filterForm.floor_legal.map((ele) => ele.value);
            const valueString = values.join();
            data.floor_legal = valueString;
        }
        if (this.filterForm.floor_marketing.length > 0) {
            const values = this.filterForm.floor_marketing.map((ele) => ele.value);
            const valueString = values.join();
            data.floor_marketing = valueString;
        }
        if (this.filterForm.beds.length > 0) {
            const values = this.filterForm.beds.map((ele) => ele.value);
            const valueString = values.join();
            data.bed = valueString;
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
        if (this.filterForm.views.length > 0) {
            const values = this.filterForm.views.map((ele) => ele);
            const valueString = values.join();
            data.views = valueString;
        }
        if (this.filterForm.spaces.length > 0) {
            const values = this.filterForm.spaces.map((ele) => ele);
            const valueString = values.join();
            data.spaces = valueString;
        }

        if (this.filterForm.baths.length > 0) {
            const values = this.filterForm.baths.map((ele) => ele.value);
            const valueString = values.join();
            data.bath = valueString;
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
        if (this.filterForm.building_type.length > 0) {
            const values = this.filterForm.building_type.map((ele) => ele._id);
            const valueString = values.join();
            data.building_type = valueString;
        }

        // console.log('this.filterForm', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitList = response.results ? response.results : [];
                    this.unitList.forEach((ele) => {
                        ele.select_unit = false;
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //OPEN ADD UNIT MODAL
    openAddUnitModal(template: TemplateRef<any>) {
        this.autosearchText = '';
        this.isEdit = false;
        this.getBuilderList();
        this.importFileModal = {};
        this.formDetails = {
            project_id: '',
            builder_id: '',
            model_id: '',
            status: 'AVAILABLE',
            building_view_floor: 1,
            building_view_height: 150,
            building_view_unit: 1,
            building_view_width: 110
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    addUnitData() {

        if (!this.formDetails.builder_id) {
            this.toastr.warning('Please select builder', 'Warning');
            return;
        }
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.unit_no || !this.formDetails.unit_no.trim()) {
            this.toastr.warning('Please enter unit number', 'Warning');
            return;
        }

        if (this.formDetails.status == 'BROKER ALLOCATED' && !this.formDetails.contact_name._id) {
            this.toastr.warning('Please enter valid broker name', 'Warning');
            return;
        }

        if (!this.formDetails.collection) {
            this.toastr.warning('Please select model collection', 'Warning');
            return;
        }
        if (!this.formDetails.model_id || !this.formDetails.model_id._id) {
            this.toastr.warning('Please enter model', 'Warning');
            return;
        }
        if (this.formDetails.is_parking_eligible && !this.formDetails.max_parking) {
            this.toastr.warning('Please enter max parking', 'Warning');
            return;
        }
        if (this.formDetails.is_locker_eligible && !this.formDetails.max_lockers) {
            this.toastr.warning('Please enter max lockers', 'Warning');
            return;
        }
        if (this.formDetails.is_bicycle_eligible && !this.formDetails.max_bicycle) {
            this.toastr.warning('Please enter max bicycles', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_floor) {
            this.toastr.warning('Please enter building view floor position', 'Warning');
            return;
        }
        if (this.formDetails.building_view_floor && this.formDetails.building_view_floor < 0) {
            this.toastr.warning('Please enter valid building view floor position', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_unit) {
            this.toastr.warning('Please enter building view unit position', 'Warning');
            return;
        }
        if (this.formDetails.building_view_unit && this.formDetails.building_view_unit < 0) {
            this.toastr.warning('Please enter valid building view unit position', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_width) {
            this.toastr.warning('Please enter building view width', 'Warning');
            return;
        }
        if (this.formDetails.building_view_width && this.formDetails.building_view_width < 0) {
            this.toastr.warning('Please enter valid building view width', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_height) {
            this.toastr.warning('Please enter building view height', 'Warning');
            return;
        }
        if (this.formDetails.building_view_height && this.formDetails.building_view_height < 0) {
            this.toastr.warning('Please enter valid building view height', 'Warning');
            return;
        }
        if (this.formDetails.merged_unit) {
            if (!this.formDetails.unit_1 && !this.formDetails.unit_2 && !this.formDetails.unit_3) {
                this.toastr.warning('Please enter at least two merged unit numbers', 'Warning');
                return;
            }
            if ((this.formDetails.unit_1 && (!this.formDetails.unit_2 && !this.formDetails.unit_3))) {
                this.toastr.warning('Please enter at least two merged unit numbers', 'Warning');
                return;
            }
            else if ((this.formDetails.unit_2 && (!this.formDetails.unit_1 && !this.formDetails.unit_3))) {
                this.toastr.warning('Please enter at least two merged unit numbers', 'Warning');
                return;
            }
            else if ((this.formDetails.unit_3 && (!this.formDetails.unit_1 && !this.formDetails.unit_2))) {
                this.toastr.warning('Please enter at least two merged unit numbers', 'Warning');
                return;
            }
            else if (this.formDetails.unit_1 && (!this.isAvailableUnit1 || !this.formDetails.unit_1_id)) {
                this.toastr.warning('Please enter valid unit number at first place', 'Warning');
                return;
            }
            else if (this.formDetails.unit_2 && (!this.isAvailableUnit2 || !this.formDetails.unit_2_id)) {
                this.toastr.warning('Please enter valid unit number at second place', 'Warning');
                return;
            }
            else if (this.formDetails.unit_3 && (!this.isAvailableUnit3 || !this.formDetails.unit_3_id)) {
                this.toastr.warning('Please enter valid unit number at third place', 'Warning');
                return;
            }
            else if ((this.formDetails.unit_3 && this.formDetails.unit_2) && (this.formDetails.unit_3 == this.formDetails.unit_2)) {
                this.toastr.warning('Please enter different unit numbers 1', 'Warning');
                return;
            }
            else if ((this.formDetails.unit_1 && this.formDetails.unit_2) && (this.formDetails.unit_1 == this.formDetails.unit_2)) {
                this.toastr.warning('Please enter different unit numbers 2', 'Warning');
                return;
            }
            else if ((this.formDetails.unit_3 && this.formDetails.unit_1) && (this.formDetails.unit_1 == this.formDetails.unit_3)) {
                this.toastr.warning('Please enter different unit numbers 3', 'Warning');
                return;
            }

        }

        var selectedBuilder = this.builderList.filter(o => o._id == this.formDetails.builder_id);
        var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
        // var selectedModel = this.modelList.filter(o => o._id == this.formDetails.model_id._id);

        var data = {
            builder_id: this.formDetails.builder_id,
            builder_name: selectedBuilder[0].name,
            project_id: this.formDetails.project_id,
            project_name: selectedProject[0].name,
            unit_no: this.formDetails.unit_no,
            status: this.formDetails.status ? this.formDetails.status : '',
            outdoor_type: this.formDetails.outdoor_type,
            area: this.formDetails.area ? this.formDetails.area : '',
            bed: this.formDetails.bed ? this.formDetails.bed : '',
            collection: this.formDetails.collection ? this.formDetails.collection : '',
            bath: this.formDetails.bath ? this.formDetails.bath : '',
            den: this.formDetails.den ? this.formDetails.den : '',
            media: this.formDetails.media ? this.formDetails.media : '',
            flex: this.formDetails.flex ? this.formDetails.flex : '',
            type: this.formDetails.type ? this.formDetails.type.trim() : '',
            model_name: this.formDetails.model_id ? this.formDetails.model_id.name : '',
            model_id: this.formDetails.model_id ? this.formDetails.model_id._id : '',
            ceiling: this.formDetails.ceiling ? this.formDetails.ceiling : '',
            outdoor_area: this.formDetails.outdoor_area ? this.formDetails.outdoor_area : '',
            floor_marketing: this.formDetails.floor_marketing ? this.formDetails.floor_marketing : '',
            floor_legal: this.formDetails.floor_legal ? this.formDetails.floor_legal : '',
            unit_no_marketing: this.formDetails.unit_no_marketing ? this.formDetails.unit_no_marketing : '',
            unit_no_legal: this.formDetails.unit_no_legal ? this.formDetails.unit_no_legal : '',
            // price: this.formDetails.price ? this.formDetails.price : '',
            // price_per_unit: this.formDetails.price_per_unit ? this.formDetails.price_per_unit : '',
            is_parking_eligible: this.formDetails.is_parking_eligible ? true : false,
            is_locker_eligible: this.formDetails.is_locker_eligible ? true : false,
            is_bicycle_eligible: this.formDetails.is_bicycle_eligible ? true : false,
            building_type:this.formDetails.building_type ? this.formDetails.building_type :''

        }
        data['building_view'] = {
            floor: this.formDetails.building_view_floor,
            unit: this.formDetails.building_view_unit,
            width: this.formDetails.building_view_width,
            height: this.formDetails.building_view_height
        }
        if (this.formDetails.views.length > 0) {
            data['views'] = this.formDetails.views;
        } else {
            data['views'] = [];
        }
        if (this.formDetails.spaces.length > 0) {
            data['spaces'] = this.formDetails.spaces;
        } else {
            data['spaces'] = [];
        }

        if (this.formDetails.lot_type) {
            let selectedLotType = this.lotTypeList.find(o => o._id == this.formDetails.lot_type);
            data['lot_information'] = {
                lot_name: selectedLotType.lot_name,
                lot_id: this.formDetails.lot_type,
                lot_area: this.formDetails.lot_area,
                width: this.formDetails.width,
                depth: this.formDetails.depth,
                is_irregular: this.formDetails.is_irregular ? true : false
            }
        }
        // add condition for broker type checking
        if (this.formDetails.status == 'BROKER ALLOCATED') {
            data['broker_id'] = this.formDetails.contact_name._id,
                data['broker_name'] = this.formDetails.contact_name.display_name
        }
        // condition for reserved status
        if (this.formDetails.status == 'RESERVED') {
            data['reservation_notes'] = this.formDetails.reservation_notes ? this.formDetails.reservation_notes : ''
        }

        // conditions for max parkings
        if (data.is_parking_eligible) {
            data['max_parking'] = this.formDetails.max_parking
        }
        if (data.is_locker_eligible) {
            data['max_lockers'] = this.formDetails.max_lockers
        }
        if (data.is_bicycle_eligible) {
            data['max_bicycle'] = this.formDetails.max_bicycle
        }
        data['merged_unit'] = this.formDetails.merged_unit;
        data['merged_units'] = [];
        if (this.formDetails.merged_unit) {
            let object = {
                unit_id: '',
                unit_no: ''
            };
            if (this.formDetails.unit_1 && this.formDetails.unit_1_id) {
                object.unit_id = this.formDetails.unit_1_id;
                object.unit_no = this.formDetails.unit_1;
                data['merged_units'].push(Object.assign({}, object));
            }
            if (this.formDetails.unit_2 && this.formDetails.unit_2_id) {
                object.unit_id = this.formDetails.unit_2_id;
                object.unit_no = this.formDetails.unit_2;
                data['merged_units'].push(Object.assign({}, object));
            }
            if (this.formDetails.unit_3 && this.formDetails.unit_3_id) {
                object.unit_id = this.formDetails.unit_3_id;
                object.unit_no = this.formDetails.unit_3;
                data['merged_units'].push(Object.assign({}, object));
            }
        }
        else {
            delete data['merged_units'];
        }
        // console.log('data==>', data);
        let url = `inventories/units`;
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onTypeChange(event) {
        if (event) {
            let selectedLot = this.lotTypeList.find((element) => element._id == event);
            if (selectedLot) {
                this.formDetails.lot_area = selectedLot.lot_area;
                this.formDetails.width = selectedLot.width;
                this.formDetails.depth = selectedLot.depth;
                this.formDetails.is_irregular = selectedLot.is_irregular ? true : false;
            }
        }
        else {
            this.formDetails.lot_area = null;
            this.formDetails.width = null;
            this.formDetails.depth = null;
            this.formDetails.is_irregular = false;

        }
    }

    builderChange() {
        if (this.formDetails.builder_id) {
            this.builderSelected = false;
        } else {
            this.builderSelected = true;
            this.formDetails.project_id = '';
            this.projectViews = [];
        }
        this.projectList = [];
        this.spinnerService.show();
        let url = `inventories/projects?builder_id=${this.formDetails.builder_id}&page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectList = response.results ? response.results : [];
                    if (this.builderSelected) {
                        this.formDetails.project_id = ''
                    }
                    else {
                        this.formDetails.project_id = this.projectList[0] ? this.projectList[0]._id : ''
                        this.projectViews = this.projectList[0] ? this.projectList[0].views ? this.projectList[0].views : [] : [];
                        // console.log('projectViews', this.projectViews);
                        this.getModelList(this.formDetails.project_id);
                        this.formDetails.views = [];
                        this.formDetails.model_id = '';
                        this.modelList = [];
                        this.formDetails.property_type = this.projectList[0].type ? this.projectList[0].type : '';

                    }
                    // this.formDetails.project_id = this.builderSelected ? '' : this.projectList[0] ? this.projectList[0]._id : '';
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });;
    }

    //handling views over add and edit unit modal as per the project 
    projectChange() {
        if (this.formDetails.project_id) {
            this.getModelList(this.formDetails.project_id);
            if (this.formDetails.project_id) {
                let projectFilterData = this.projectList.find((element) => element._id == this.formDetails.project_id);
                this.projectViews = projectFilterData ? projectFilterData.views ? projectFilterData.views : [] : [];
                this.formDetails.views = [];
                this.formDetails.property_type = projectFilterData.type ? projectFilterData.type : '';
            }
        }
        else if (!this.formDetails.project_id) {
            this.formDetails.model_id = { name: '', _id: '' };
            this.modelList = [];
            this.projectViews = [];

            this.formDetails.outdoor_type = '';
            this.formDetails.area = '';
            this.formDetails.bed = '';
            this.formDetails.bath = '';
            this.formDetails.den = '';
            this.formDetails.media = '';
            this.formDetails.flex = '';
            this.formDetails.ceiling = '';
            this.formDetails.outdoor_area = '';
            this.formDetails.is_parking_eligible = '';
            this.formDetails.is_locker_eligible = '';
            this.formDetails.is_bicycle_eligible = '';
            this.formDetails.max_parking = '';
            this.formDetails.max_lockers = '';
            this.formDetails.max_bicycle = '';
            this.formDetails.property_type = '';

        }
    }

    //handling allow import over unit import modal as per the project 
    importProjectChange() {
        this.getModelList(this.importFileModal.project_id);
        this.fileDocument = null;
        let selectedImportedProject = this.projectListByBuilder.find((project) => project._id == this.importFileModal.project_id);
        if (selectedImportedProject) {
            if (selectedImportedProject.hasOwnProperty('import_units')) {
                this.allowImport = selectedImportedProject.import_units ? true : false;
                if (!this.allowImport) {
                    this.toastr.warning('Unit import is not allowed for this project ', 'Warning');
                }
            }
            else {
                this.allowImport = false;
                this.toastr.warning('Unit import is not allowed for this project ', 'Warning');
            }
        }
        else {
            this.toastr.warning('Project not exist', 'Warning');
        }
    }

    onModelSection(event) {
        if (this.formDetails.model_id && this.formDetails.model_id._id) {
            this.formDetails.model = this.formDetails.model_id.name;
            if (!this.isEdit) {
                this.getModelDetails(this.formDetails.model_id._id);
            }
        }
    }

    filterModel(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        if (this.modelList.length > 0) {
            let filterModels = this.modelList.filter((ele) => ele.collection == this.formDetails.collection);
            if (filterModels.length > 0) {
                for (let i = 0; i < filterModels.length; i++) {
                    let model = filterModels[i];
                    if (model.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                        filtered.push(model);
                    }
                }
            }
            else {
                for (let i = 0; i < this.modelList.length; i++) {
                    let model = this.modelList[i];
                    if (model.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                        filtered.push(model);
                    }
                }
            }

            this.modelListSuggestions = filtered;
        }
    }

    getModelDetails(id) {
        this.spinnerService.show();
        let url = `inventories/models?_id=${id}&page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    // console.log('selectedModel', response.result);
                    const { area, bath, bed, views, spaces, ceiling, flex, media, type, den, collection, outdoor_type, building_type, is_bicycle_eligible, outdoor_area, is_locker_eligible, is_parking_eligible, max_lockers, max_parking, max_bicycle } = response.result;
                    this.formDetails.outdoor_type = outdoor_type;
                    this.formDetails.type = type;
                    this.formDetails.area = area;
                    this.formDetails.bed = bed;
                    this.formDetails.bath = bath;
                    this.formDetails.den = den;
                    this.formDetails.media = media;
                    this.formDetails.collection = collection;
                    this.formDetails.flex = flex;
                    this.formDetails.ceiling = ceiling;
                    this.formDetails.outdoor_area = outdoor_area;
                    this.formDetails.views = views ? views.length > 0 ? views : [] : [];
                    this.formDetails.spaces = spaces ? spaces.length > 0 ? spaces : [] : [];
                    this.formDetails.is_parking_eligible = is_parking_eligible;
                    this.formDetails.is_locker_eligible = is_locker_eligible;
                    this.formDetails.is_bicycle_eligible = is_bicycle_eligible;
                    this.formDetails.max_parking = max_parking;
                    this.formDetails.max_lockers = max_lockers;
                    this.formDetails.max_bicycle = max_bicycle;
                    this.formDetails.building_type=building_type ? building_type :'condominium'

                } else {
                    // this.builderList = [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    modelFilterChange(event) {
        if (event.target.value) {
            this.getUnitList();
        }
        else {
            this.filterForm.model_id = "";
            this.getUnitList();

        }
    }

    setFloorPosition() {
        if (this.formDetails.floor_legal) {
            const parseValue = parseInt(this.formDetails.floor_legal);
            if (parseValue && parseValue > 0) {
                this.formDetails.building_view_floor = parseValue;
            }
            else {
                this.formDetails.building_view_floor = 1;
            }
        }
    }

    filterCollections() {
        this.collectionList = this.modelList.map(ele => ele.collection).filter((ele, i, arr) => arr.indexOf(ele) == i);
    }

    collectionChange() {
        this.formDetails.model_id = '';
    }

    setUnitPosition() {
        if (this.formDetails.unit_no_legal) {
            const parseValue = parseInt(this.formDetails.unit_no_legal);
            if (parseValue && parseValue > 0) {
                this.formDetails.building_view_unit = parseValue;
            }
            else {
                this.formDetails.building_view_unit = 1;

            }
        }
    }
    
    searchAuto(event) {
        this.autosearchText = event.query;
        this.getContactList();
    }

    getContactList() {
        let url = `sales/contacts?page=1&pageSize=100&sortBy=display_name&sortOrder=ASC&searchText=${this.autosearchText}`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    this.contactList = response.results ? response.results : [];
                }
                this.contactList.forEach(item => {
                    if (item.phones && item.phones.length > 0) {
                        let keepGoing = true;
                        item.phones.forEach(phone => {
                            if (keepGoing) {
                                if (!phone.is_inactive) {
                                    item.phones = {
                                        number: phone.number
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.phones = {
                            number: ''
                        }
                    }
                    if (item.emails && item.emails.length > 0) {
                        let keepGoing = true;
                        item.emails.forEach(email => {
                            if (keepGoing) {
                                if (!email.is_inactive) {
                                    item.emails = {
                                        email: email.email
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.emails = {
                            email: ''
                        }
                    }
                    if (item.addresses && item.addresses.length > 0) {
                        let keepGoing = true;
                        item.addresses.forEach(address => {
                            if (keepGoing) {
                                if (!address.is_inactive) {
                                    item.addresses = address;
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.addresses = {};
                    }
                    item.show_name = `${item._id}, ${item.display_name ? item.display_name : ''},  ${item.emails.email ? item.emails.email : ''}, ${item.phones.number ? item.phones.number : ''}`;
                });
            } else {
                this.contactList = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //MERGE UNITS
    checkUnitExistance(value, index) {
        if (value && value > 0) {
            let url = `inventories/units?project_id=${this.formDetails.project_id}&unit_no=${value}`;
            this.spinnerService.show();
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    let record = response.results.find((element) => element.unit_no == value);
                    if (record != null && (record.status == 'AVAILABLE')) {
                        switch (index) {
                            case 1:
                                this.formDetails.unit_1_id = record._id;
                                this.isAvailableUnit1 = true;
                                break;
                            case 2:
                                this.formDetails.unit_2_id = record._id;
                                this.isAvailableUnit2 = true;
                                break;
                            case 3:
                                this.formDetails.unit_3_id = record._id;
                                this.isAvailableUnit3 = true;
                                break;
                        }

                    }
                    else {
                        switch (index) {
                            case 1:
                                this.formDetails.unit_1_id = '';
                                this.isAvailableUnit1 = false;
                                break;
                            case 2:
                                this.formDetails.unit_2_id = '';
                                this.isAvailableUnit2 = false;
                                break;
                            case 3:
                                this.formDetails.unit_3_id = '';
                                this.isAvailableUnit3 = false;
                                break;
                        }
                    }
                    // console.log('formDetails', this.formDetails);
                } else {
                    this.toastr.error(response.message, 'Error');
                }

            }, (error) => {
                console.log('error', error);
            });
        }
    }

    /// PAGINATION ///
    doPaginationWise(page) {
        this.page = page;
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
    selectAll() {
        for (var i = 0; i < this.unitList.length; i++) {
            if (this.unitList[i].status != 'SOLD' && this.unitList[i].status != 'MERGED & RETIRED') {
                this.unitList[i].select_unit = this.selectedAll;
            }
        }
        this.onChangeCheckbox();
    }
    onChangeCheckbox() {
        event ? event.stopPropagation() : true;
        let records = this.unitList.filter(element => element.select_unit == true);
        if (records.length > 0) {
            this.isBulkAssign = true;
        }
        else {
            this.isBulkAssign = false;
        }
    }
    /// SEARCH ///
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getUnitList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getUnitList();
    }

    /// FILTERS ///
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        // this.filterForm.project_id = '';
        this.filterForm.model_id = [];
        this.filterForm.status = [];
        this.filterForm.beds = [];
        this.filterForm.baths = [];
        this.filterForm.floor_legal = [];
        this.filterForm.floor_marketing = [];
        this.filterForm.views = [];
        this.filterForm.spaces = [];
        this.filterForm.media = [];
        this.filterForm.flex = [];
        this.filterForm.ceiling = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        this.filterForm.building_type=[]
        this.floorList=[];
        this.getUnitList();
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            // project_id: this.filterForm.project_id,
            model_id: this.filterForm.model_id,
            beds: this.filterForm.beds,
            baths: this.filterForm.baths,
            media: this.filterForm.media,
            flex: this.filterForm.flex,
            ceiling: this.filterForm.ceiling,
            status: this.filterForm.status,
            floor_legal: this.filterForm.floor_legal,
            floor_marketing: this.filterForm.floor_marketing,
            views: this.filterForm.views,
            spaces:this.filterForm.spaces,
            collection: this.filterForm.collection,
            type: this.filterForm.type,
            building_type:this.filterForm.building_type

        }
        localStorage.setItem('inventoriesUnitFilterData', JSON.stringify(data));
    }

    onItemSelect(type?) {
        this.page = 1;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        
        if(type!='floor_legal' && type!='floor_marketing'){            
            this.floorList=[];
            this.filterForm.floor_legal = [];
            this.filterForm.floor_marketing = [];    
        }
        if(type=='building_type'){
            if(this.filterForm.building_type.length==1 && this.filterForm.building_type[0]._id=='condominium'){
                let floors= this.addtionalDetails[0] ? this.addtionalDetails[0].total_floors :0;
                this.getFloorList(floors);
            }
        }
       
       
        this.getUnitList();
    }
    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if(type!='floor_legal' && type!='floor_marketing'){            
            this.floorList=[];
            this.filterForm.floor_legal = [];
            this.filterForm.floor_marketing = [];    
        }
        if(type=='building_type'){
            if(this.filterForm.building_type.length==1 && this.filterForm.building_type[0]._id=='condominium'){
                let floors= this.addtionalDetails[0] ? this.addtionalDetails[0].total_floors :0;
                this.getFloorList(floors);
            }
        }
        
        this.getUnitList();
    }
    onViewsSelect(type, event) {
        this.formDetails[type] = event;
    }

    onSpacesSelect(type, event) {
        this.formDetails[type] = event;
    }

    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if(type!='floor_legal' && type!='floor_marketing'){            
            this.floorList=[];
            this.filterForm.floor_legal = [];
            this.filterForm.floor_marketing = [];    
        }
        this.getUnitList();
    }


    /////// IMPORT UNIT //////
    openImportModal(template: TemplateRef<any>) {
        this.getBuilderList();
        this.formDetails = {};
        this.importFileModal = {
            project_id: '',
            builder_id: '',
            model_id: '',
            file: ''
        };
        this.fileChoosed = false;
        this.allowImport = false;
        this.fileDocument = null;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getProjectListByBuilder() {
        this.projectListByBuilder = [];
        this.importFileModal.project_id = '';
        this.allowImport = false;
        this.spinnerService.show();
        let url = `inventories/projects?builder_id=${this.importFileModal.builder_id}&page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectListByBuilder = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    filterItems(filteredList) {
        // console.log(bytes)
        return new Promise(resolve => {
            let data = filteredList.map(arr => {
                let object: any = {};
                if (arr[0]) {
                    object.unit_no = arr[0]
                }
                if (arr[1]) {
                    object.unit_no_legal = arr[1]
                }
                if (arr[2]) {
                    object.floor_marketing = arr[2]
                }
                if (arr[3]) {
                    object.floor_legal = arr[3]
                }
                if (arr[4]) {
                    object.price = arr[4]
                }
                if (arr[5]) {
                    object.unit_premium = arr[5]
                }
                if (arr[6]) {
                    object.floor_premium = arr[6]
                }
                if (arr[7]) {
                    object.tax = arr[7]
                }
                if (arr[8]) {
                    object.sales_price = arr[8]
                }
                // if (arr[9] || arr[10] || arr[11] || arr[12]) {
                //     object.building_view = {};
                // }
                if (arr[9]) {
                    object.building_view_floor = arr[9]
                }
                if (arr[10]) {
                    object.building_view_unit = arr[10]
                }
                if (arr[11]) {
                    object.building_view_width = arr[11]
                }
                if (arr[12]) {
                    object.building_view_height = arr[12]
                }
                if (arr[13]) {
                    object.collection = arr[13]
                }
                if (arr[14]) {
                    object.model_name = arr[14]
                }
                if (arr[15]) {
                    object.type = arr[15]
                }
                if (arr[16]) {
                    object.bed = arr[16]
                }
                if (arr[17]) {
                    object.bath = arr[17]
                }
                if (arr[18]) {
                    object.den = arr[18]
                }
                if (arr[19]) {
                    object.media = arr[19]
                }
                if (arr[20]) {
                    object.flex = arr[20]
                }
                if (arr[21]) {
                    object.ceiling = arr[21]
                }
                if (arr[22]) {
                    object.area = arr[22]
                }
                if (arr[23]) {
                    object.outdoor_type = arr[23]
                }
                if (arr[24]) {
                    object.outdoor_area = arr[24]
                }
                if (arr[25]) {
                    object.views = arr[25]
                }
                if (arr[26]) {
                    object.spaces = arr[26]
                }
                if (arr[27]) {
                    object.max_parking = arr[27]
                }
                if (arr[28]) {
                    object.max_lockers = arr[28]
                }
                if (arr[29]) {
                    object.max_bicycle = arr[29]
                }
                // if (arr[1]) {
                //     object.status = arr[1].toUpperCase()
                // }
                // if (arr[3]) {
                //     object.unit_no_marketing = arr[3]
                // }
                if (arr[30]) {
                    object.notes = arr[30]
                }
                if (arr[31]) {
                    object.atrribute_1 = arr[31]
                }
                if (arr[32]) {
                    object.atrribute_2 = arr[32]
                }
                if (arr[33]) {
                    object.atrribute_3 = arr[33]
                }
                if (arr[34]) {
                    object.atrribute_4 = arr[34]
                }
                if (arr[35]) {
                    object.atrribute_5 = arr[35]
                }
                // if (arr[16]) {
                //     object.price_per_unit = arr[16]
                // }
                // if (arr[17]) {
                //     object.is_parking_eligible = arr[17]
                // }
                // if (arr[18]) {
                //     object.is_locker_eligible = arr[18]
                // }
                // if (arr[19]) {
                //     object.is_bicycle_eligible = arr[19]
                // }
                // if (arr[23]) {
                //     object.broker_id = arr[23]
                // }
                // if (arr[24]) {
                //     object.broker_name = arr[24]
                // }
                return object;
            })
            resolve(data);
        });
    }
    async onImportFile(template: TemplateRef<any>) {
        if (!this.importFileModal.builder_id) {
            this.toastr.warning('Please select builder', 'Warning');
            return;
        }
        if (!this.importFileModal.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        // if (!this.importFileModal.model_id) {
        //     this.toastr.warning('Please select model', 'Warning');
        //     return;
        // }
        if (!this.fileDocument) {
            this.toastr.warning('Please select file', 'Warning');
            return;
        }
        this.importRecords = [];
        this.fileChoosed = true;
        this.cdk.detectChanges();
        this.excelService.importFromFile(this.fileDocument).then((res) => {
            const records: any = res;
            this._handleReaderLoaded(template, records);
        })
            .catch((error) => {
                this.fileChoosed = false;
                console.log(error, 'Warning');
                this.toastr.warning('Something went wrong ! please upload right file', 'Error');

            });
    }

    async _handleReaderLoaded(template, records) {
        const filteredList = records.filter((element) => element.length > 0);
        const importedData = filteredList.splice(0, 1);
        this.getUnits.clear();
        this.filterItems(filteredList).then((res) => {
            this.importRecords = res;
            this.importRecords.forEach(model => { //CREATNG GROUP CONTROL FOR EACH RECORD
                this.appendUnitGroup(model);
            });

            this.modalRef.hide();
            this.fileChoosed = false;
            this.fileDocument = null;
            this.importUnitsRef = this.modalService.show(template, { class: 'custom-wide-modal modal-xl', backdrop: 'static' });
        })
            .catch((error) => {
                console.log('error=>', error);
                this.fileChoosed = false;
                this.spinnerService.hide();
                this.toastr.warning('Something went wrong ! please upload right file', 'Error');
            })

    }

    //API CALL FOR VALIDATED IMPORTED RECORDS
    addImportedFinalRecord() {
        // console.log('units=>', this.unitForm.value.units);
        this.spinnerService.show();
        let slectedBuilder = this.builderList.filter((element) => element._id == this.importFileModal.builder_id)
        let selectedProject = this.projectListByBuilder.filter((element) => element._id == this.importFileModal.project_id)
        this.filterUnits(this.unitForm.value.units).then((filteredUnits: any) => {
            if (filteredUnits && filteredUnits.length > 0) {
                filteredUnits.forEach(unit => {
                    unit.price= unit.price? +unit.price :'';
                    unit.sales_price= unit.sales_price? +unit.sales_price :'';
                    unit.unit_premium= unit.unit_premium? +unit.unit_premium :'';
                    unit.floor_premium= unit.floor_premium? +unit.floor_premium :'';
                    unit.tax= unit.tax? +unit.tax :'';

                    unit.price= unit.price? Math.round(unit.price*100)/100 :'';
                    unit.sales_price= unit.sales_price?  Math.round(unit.sales_price*100)/100 :'';
                    unit.unit_premium= unit.unit_premium? Math.round(unit.unit_premium*100)/100 :'';
                    unit.floor_premium= unit.floor_premium?  Math.round(unit.floor_premium*100)/100 :'';
                    unit.tax= unit.tax? Math.round(unit.tax*100)/100 :'';

                    unit.builder_id = this.importFileModal.builder_id;
                    unit.builder_name = slectedBuilder[0].name ? slectedBuilder[0].name : '';
                    unit.project_id = this.importFileModal.project_id;
                    unit.project_name = selectedProject[0].name ? selectedProject[0].name : '';
                    let selectedModel = this.modelList.filter((ele) => ele.name == unit.model_name)
                    // console.log('selectedModel', selectedModel);
                    unit.building_type=unit.building_type ? unit.building_type :''

                    if (selectedModel && selectedModel[0] && selectedModel[0]._id) {
                        unit.model_id = selectedModel[0]._id
                    }
                    else {
                        unit.model_id = '';
                    }
                    // element.model_name = selectedModel[0].name ? selectedModel[0].name : '';
                    if (unit.views) {
                        if ((unit.views.indexOf('/')) != -1) {
                            let views = unit.views.split('/');
                            let trimedViews = [];
                            views.forEach((view) => {
                                trimedViews.push(view.trim());
                            });
                            unit.views = trimedViews;
                        }
                        else if ((unit.views.indexOf(',')) != -1) {
                            let views = unit.views.split(',');
                            let trimedViews = [];
                            views.forEach((view) => {
                                trimedViews.push(view.trim());
                            });
                            unit.views = trimedViews;
                        }
                        else {
                            let views = unit.views.split(',');
                            unit.views = views.length > 0 ? views : [];
                        }

                    }
                    if (unit.spaces) {
                        //extracting values of name and size from the space string
                        let spacesArray = [];
                        if ((unit.spaces.indexOf('/')) != -1) {
                            spacesArray = unit.spaces.split("/");
                        }
                        else if ((unit.spaces.indexOf(',')) != -1) {
                            spacesArray = unit.spaces.split(",");
                        }

                        let newSpaces = [];
                        if (spacesArray) {
                            spacesArray.forEach(ele => {
                                let element_ = ele.trim();
                                const singleSpaceArray = element_.split(' ');
                                let obj = {};
                                obj['name'] = singleSpaceArray[0] ? singleSpaceArray[0].trim() : '';
                                obj['size'] = singleSpaceArray[1] ? parseFloat(singleSpaceArray[1]) : '';
                                newSpaces.push(obj);
                            });
                        }
                        unit.spaces = newSpaces;
                    }
                    // conditions for max parkings eligible flag
                    unit['is_parking_eligible'] = unit.max_parking > 0 ? true : false;
                    unit['is_locker_eligible'] = unit.max_lockers > 0 ? true : false;
                    unit['is_bicycle_eligible'] = unit.max_bicycle > 0 ? true : false

                });

                // console.log('filteredUnits', filteredUnits);
                // API call for sending records to server
                let data_ = { 'records': filteredUnits }
                let url = `inventories/units-import`;

                this.webService.post(url, data_).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.importUnitsRef.hide();
                            this.importRecords = [];
                            this.clearUnitBulkEditModal();
                            this.getUnitList();
                            this.toastr.success(response.message, 'Success')
                        }
                    } else {
                        this.toastr.error('Your Session expired', 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                    }
                }, (error) => {
                    this.spinnerService.hide();
                    console.log('error', error);
                });

            }
        })
            .catch((error) => {
                console.log('error', error);
                this.toastr.warning('Sorry something went wrong', 'Error');

            })
    }

    //UNITS FORM for BULK EDIT
    get getUnits(): FormArray {
        return this.unitForm.get('units') as FormArray;
    }

    appendUnitGroup(item) {
        this.getUnits.push(this.createUnitGroup(item));
    }

    createUnitGroup(item) {
        return this.formBuilder.group({
            unit_no: [item.unit_no ? item.unit_no.toString() : '', [Validators.required]],
            unit_no_legal: [item.unit_no_legal ? item.unit_no_legal.toString() : ''],
            floor_marketing: [item.floor_marketing ? item.floor_marketing.toString() : ''],
            floor_legal: [item.floor_legal ? item.floor_legal.toString() : ''],
            price: [item.price ? item.price : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            unit_premium: [item.unit_premium ? item.unit_premium : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            floor_premium: [item.floor_premium ? item.floor_premium : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            tax: [item.tax ? item.tax : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            sales_price: [item.sales_price ? item.sales_price : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            building_view_floor: [item.building_view_floor ? item.building_view_floor : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            building_view_unit: [item.building_view_unit ? item.building_view_unit : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            building_view_width: [item.building_view_width ? item.building_view_width : 110, [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            building_view_height: [item.building_view_height ? item.building_view_height : 150, [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            collection: [item.collection ? item.collection : ''],
            model_name: [item.model_name ? item.model_name : '', [Validators.required]],
            type: [item.type ? item.type : ''],
            bed: [item.bed ? item.bed : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            bath: [item.bath ? item.bath : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            den: [item.den ? item.den : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            media: [item.media ? item.media : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            flex: [item.flex ? item.flex : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            ceiling: [item.ceiling ? item.ceiling : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            area: [item.area ? item.area : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            outdoor_type: [item.outdoor_type ? item.outdoor_type : ''],
            outdoor_area: [item.outdoor_area ? item.outdoor_area : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            views: [item.views ? item.views : ''],
            spaces: [item.spaces ? item.spaces : ''],
            max_parking: [item.max_parking ? item.max_parking : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            max_lockers: [item.max_lockers ? item.max_lockers : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            max_bicycle: [item.max_bicycle ? item.max_bicycle : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            notes: [item.notes ? item.notes : ''],
            atrribute_1: [item.atrribute_1 ? item.atrribute_1 : ''],
            atrribute_2: [item.atrribute_2 ? item.atrribute_2 : ''],
            atrribute_3: [item.atrribute_3 ? item.atrribute_3 : ''],
            atrribute_4: [item.atrribute_4 ? item.atrribute_4 : ''],
            atrribute_5: [item.atrribute_5 ? item.atrribute_5 : '']

        })
    }

    clearUnitBulkEditModal() {
        this.getUnits.clear();
    }

    filterUnits(filteredList) {
        return new Promise((resolve, reject) => {
            let data = filteredList.map((key) => {
                let object: any = {};
                object.status = 'AVAILABLE'
                if (key.unit_no) {
                    object.unit_no = key.unit_no
                }
                if (key.unit_no_legal) {
                    object.unit_no_legal = key.unit_no_legal
                }
                if (key.floor_marketing) {
                    object.floor_marketing = key.floor_marketing
                }
                if (key.floor_legal) {
                    object.floor_legal = key.floor_legal
                }
                if (key.price) {
                    object.price = parseFloat(key.price)
                }
                if (key.unit_premium) {
                    object.unit_premium = parseFloat(key.unit_premium)
                }
                if (key.floor_premium) {
                    object.floor_premium = parseFloat(key.floor_premium)
                }
                if (key.tax) {
                    object.tax = parseFloat(key.tax)
                }
                if (key.sales_price) {
                    object.sales_price = parseFloat(key.sales_price)
                }
                if (key.building_view_floor || key.building_view_unit || key.building_view_width || key.building_view_height) {
                    object.building_view = {};
                }

                if (key.building_view_floor) {
                    object['building_view'].floor = parseFloat(key.building_view_floor)
                }
                if (key.building_view_unit) {
                    object['building_view'].unit = parseFloat(key.building_view_unit)
                }
                if (key.building_view_width) {
                    object['building_view'].width = parseFloat(key.building_view_width)
                }
                if (key.building_view_height) {
                    object['building_view'].height = parseFloat(key.building_view_height)
                }

                if (key.collection) {
                    object.collection = key.collection
                }
                if (key.model_name) {
                    object.model_name = key.model_name
                }
                if (key.type) {
                    object.type = key.type
                }
                if (key.bed) {
                    object.bed = parseFloat(key.bed)
                }
                if (key.bath) {
                    object.bath = parseFloat(key.bath)
                }
                if (key.den) {
                    object.den = parseFloat(key.den)
                }
                if (key.media) {
                    object.media = parseFloat(key.media)
                }
                if (key.flex) {
                    object.flex = parseFloat(key.flex)
                }
                if (key.ceiling) {
                    object.ceiling = parseFloat(key.ceiling)
                }
                if (key.area) {
                    object.area = parseFloat(key.area)
                }
                if (key.outdoor_type) {
                    object.outdoor_type = key.outdoor_type
                }
                if (key.outdoor_area) {
                    object.outdoor_area = parseFloat(key.outdoor_area)
                }
                if (key.views) {
                    object.views = key.views
                }
                if (key.spaces) {
                    object.spaces = key.spaces
                }
                if (key.max_parking) {
                    object.max_parking = parseFloat(key.max_parking)
                }
                if (key.max_lockers) {
                    object.max_lockers = parseFloat(key.max_lockers)
                }
                if (key.max_bicycle) {
                    object.max_bicycle = parseFloat(key.max_bicycle)
                }
                if (key.notes) {
                    object.notes = key.notes
                }
                if (key.atrribute_1) {
                    object.atrribute_1 = key.atrribute_1
                }
                if (key.atrribute_2) {
                    object.atrribute_2 = key.atrribute_2
                }
                if (key.atrribute_3) {
                    object.atrribute_3 = key.atrribute_3
                }
                if (key.atrribute_4) {
                    object.atrribute_4 = key.atrribute_4
                }
                if (key.atrribute_5) {
                    object.atrribute_5 = key.atrribute_5
                }
                // if (arr[3]) {
                //     object.unit_no_marketing = arr[3]
                // }


                return object;
            })
            resolve(data);
        });
    }

    uploadRecordFile(files: FileList) {
        if (files.length > 0) {
            let validation = this.validateProjectDocumentUpload(files.item(0).name);
            if (validation) {
                this.fileDocument = files.item(0);

            } else {
                this.toastr.error("Please upload only CSV", "Error");
            }
        }
    }

    validateProjectDocumentUpload(fileName) {
        var allowed_extensions = new Array("csv");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    downloadTemplatefile() {
        let link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = 'assets/templates/unit-records-format.xlsx';
        link.download = 'unit-template.xlsx';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    ///// Allocate Broker /////
    openAllocateBrokerModal(template: TemplateRef<any>) {
        this.brokerSearchQuery = '';
        this.getProjectListForBroker();
        this.selectedAllUnit = false;
        this.getAllUnitList();
        setTimeout(() => {
            this.modalRef = this.modalService.show(template, { class: 'custom-wide-modal modal-xl', backdrop: 'static' });
        }, 2000)

    }

    getProjectListForBroker() {
        this.projectList = [];
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectListforBroker = response.results ? response.results : [];
                    let selectedProject = this.projectListforBroker.find(o => o._id == this.filterForm.project_id);
                    this.formDetails = {
                        project_id: this.filterForm.project_id,
                        project_name: selectedProject.name
                    };

                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    

    clearBroker() {
        this.formDetails.broker_name = null;
    }

    addAllocatedBroker() {
        let selectedUnits = this.allUnitList.filter((unit) => unit.is_selected == true);

        if (!this.formDetails.broker_name || !this.formDetails.broker_name._id) {
            this.toastr.warning('Please select broker from the list', 'Warning');
            return;
        }
        if (selectedUnits.length == 0) {
            this.toastr.warning('Please select at least one units', 'Warning');
            return;

        }

        let data: any = {};
        data.broker_id = this.formDetails.broker_name._id;

        const filetrUnits = selectedUnits.map((element) => element._id);
        data.units = filetrUnits;
        let url = `inventories/allocate-broker-to-units`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getUnitList();
                    this.modalRef.hide();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    filterGroupedBroker(event) {
        this.brokerSearchQuery = event.query;
        let filteredBrokerGroups = [];
        let url = `sales/contacts?page=1&pageSize=100&sortBy=display_name&sortOrder=ASC&searchText=${this.brokerSearchQuery}`;
        let groupedBroker = [];

        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    let results = response.results;
                    groupedBroker = [...this.groupedBroker];
                    groupedBroker[0].items = [];
                    groupedBroker[1].items = [];
                    results.forEach(element => {
                        if(element){
                            if (element.contact_type.indexOf('Broker') != -1) {
                                let item = {
                                    label: `${element.display_name}`,
                                    _id: `${element._id}`
                                }
                                groupedBroker[0].items.push(item);
                            }
                            else {
                                let item = {
                                    label: `${element.display_name}`,
                                    _id: `${element._id}`
                                }
                                groupedBroker[1].items.push(item);
                            }
                        }
                    });

                } else {
                    groupedBroker = [];
                }
                this.filteredBrokerGroups = [...groupedBroker];

            }
        }, (error) => {
            this.filteredBrokerGroups = [];
            console.log('error', error);

        })

    }

    getBrokerList(event) {
        this.autosearchText = event.query;
        let url = `sales/contacts?page=1&pageSize=100&sortBy=display_name&sortOrder=ASC&searchText=${this.autosearchText}`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    this.brokerList = response.results;
                }
                this.brokerList.forEach(item => {
                    if (item.phones && item.phones.length > 0) {
                        let keepGoing = true;
                        item.phones.forEach(phone => {
                            if (keepGoing) {
                                if (!phone.is_inactive) {
                                    item.phone = {
                                        number: phone.number,
                                        type: phone.type
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.phone = {
                            number: '',
                            type: ''
                        }
                    }
                    if (item.emails && item.emails.length > 0) {
                        let keepGoing = true;
                        item.emails.forEach(email => {
                            if (keepGoing) {
                                if (!email.is_inactive) {
                                    item.email = {
                                        email: email.email,
                                        type: email.type
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.email = {
                            email: '',
                            type: ''
                        }
                    }
                    if (item.addresses && item.addresses.length > 0) {
                        let keepGoing = true;
                        item.addresses.forEach(address => {
                            if (keepGoing) {
                                if (!address.is_inactive) {
                                    item.addresses = address;
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.addresses = {};
                    }
                    item.show_name = `${item._id}, ${item.display_name ? item.display_name : ''},  ${item.email.email ? item.email.email : ''}, ${item.phone.number ? item.phone.number : ''}`;
                });
            } else {
                this.brokerList = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    selectAllUnits() {
        for (var i = 0; i < this.allUnitList.length; i++) {
            this.allUnitList[i].is_selected = this.selectedAllUnit;
        }
    }

    getAllUnitList() {
        let url = `inventories/units?project_id=${this.filterForm.project_id}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    let result = response.results ? response.results : [];
                    this.allUnitList = result.filter((unit) => (unit.status == 'AVAILABLE' || !unit.status || unit.status == ''));
                    this.allUnitList.forEach((unit) => {
                        unit.is_selected = false;
                    })
                }

            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openNewContact() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            project_id: this.filterForm
        }
        this.openContactModalRef.result.then(async (result) => {
            if (result) {
                console.log('result==>', result);
                this.formDetails.broker_name = {
                    _id: result._id,
                    label: result.display_name
                }

            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }

    navigateToDealDetails(id) {
        let url = `#/sales/deals/${id}`;
        window.open(url, '_blank');
    }


    ///UPDATE STATUS////
    openAssignDetailModal(template: TemplateRef<any>) {
        this.formDetails = {
            status: ''
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    updateUnit() {
        let selectedUnits = this.unitList.filter((element) => (element.status != 'SOLD' && element.status != 'MERGED & RETIRED') && element.select_unit);
        let data: any = { ...this.formDetails };
        data.units = selectedUnits.map((unit) => unit._id);
        let url = `inventories/bulk-update-of-units`;
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
}
