import { Component, OnInit, TemplateRef, Input, DoCheck, Renderer2, ChangeDetectorRef, SimpleChange } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { element } from 'protractor';
import { ExcelService } from '../../../services/excel.service';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

export class Record {

}
@Component({
    selector: 'app-models',
    templateUrl: './models.component.html',
    styleUrls: ['./models.component.css']
})
export class ModelsComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    @Input() user_id: String;
    @Input() returnUrl: String;
    paginationObj: any = {};
    modalRef: BsModalRef;
    importModalRef: BsModalRef;
    formDetails: any = {
        views: []
    };
    filterForm: any = {
        searchText: '',
        project_id: '',
        beds: [],
        baths: [],
        dens: [],
        views: [],
        spaces: [],
        media: [],
        flex: [],
        ceiling: [],
        collection: [],
        type: []
    };
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_created';
    reverse: boolean = true;
    isClear: boolean = false;
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    projectList: any = [];
    modelList: any = [];
    projectModelList: any = [];
    viewName: any;
    spaceName: any;
    isDuplicateModel: boolean = false;
    modelViews: any[] = [];
    modelSpaces: any[] = [];
    addModelViews: any[] = [];
    addModelSpaces: any[] = [];
    numberFields: any[] = [
        { _id: 1, value: 1 },
        { _id: 2, value: 2 },
        { _id: 3, value: 3 },
        { _id: 4, value: 4 },
        { _id: 5, value: 5 }
    ];
    ceilingFields: any[] = [
        { _id: 9, value: 9 },
        { _id: 10, value: 10 },
        { _id: 11, value: 11 },
        { _id: 12, value: 12 },
        { _id: 13, value: 13 },
        { _id: 14, value: 14 },
        { _id: 15, value: 15 }
    ];
    dropdownSettings = {};
    importFileModal: any = {

    };
    public modelForm: FormGroup;

    builderList: any[] = [];
    projectListByBuilder: any[] = [];
    fileDocument: any;
    importRecords: any = [];
    fileChoosed: boolean = false;
    measureUnits: any[] = [];
    allowImport: boolean = false;
    collectionOptions: any[] = [];
    typeOptions: any[] = [];

    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private renderer: Renderer2,
        private excelService: ExcelService,
        private cdk: ChangeDetectorRef,
        private formBuilder: FormBuilder
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        this.getModelList();
        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            // itemsShowLimit: 1,
            allowSearchFilter: true
        };
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            this.filterForm.spaces = [];
            this.filterForm.views = [];
            if (response) {
                this.filterForm.project_id = response._id;
                this.onProjectChange(response);
            }
            else {
                this.filterForm.project_id = '';
                this.onProjectChange('');
            }

        });
        this.modelForm = this.formBuilder.group({
            models: this.formBuilder.array([])
        });

        // this.DATA.forEach((model) => {
        //     this.appendModelGroup(model);
        // })
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('inventoriesModelFilterData');
        let projectFilterData: any = localStorage.getItem('inventoriesProjectData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData._id) {
                this.filterForm.project_id = projectFilterData._id;
                this.modelViews = projectFilterData.views ? projectFilterData.views.length > 0 ? projectFilterData.views : [] : [];
                this.modelSpaces = projectFilterData.spaces ? projectFilterData.spaces.length > 0 ? projectFilterData.spaces : [] : [];
            }
        }

        if (filterData) {
            filterData = JSON.parse(filterData);

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
            if (filterData.views) {
                this.filterForm.views = filterData.views;
            }
            else {
                this.filterForm.views = [];
            }
            if (filterData.spaces) {
                this.filterForm.spaces = filterData.spaces;
            }
            else {
                this.filterForm.spaces = [];
            }
            if (filterData.dens) {
                this.filterForm.dens = filterData.dens;
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

        this.getOptionsTypeList();
        this.getOptionsCollectionList();
    }

    //function get called on project change event from table filter
    onProjectChange(selectedProject) {
        this.filterForm.model_id = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        if (selectedProject) {    //extracting views and spaces 
            // let selectedProject = this.projectList.filter((element) => element._id == selectedProject._id);
            this.modelViews = selectedProject.views ? selectedProject.views.length > 0 ? selectedProject.views : [] : [];
            this.modelSpaces = selectedProject.spaces ? selectedProject.spaces.length > 0 ? selectedProject.spaces : [] : [];
            this.filterForm.views = [];
            this.filterForm.spaces = [];
            this.getModelList(); //calling list api
            this.getOptionsTypeList();
            this.getOptionsCollectionList();
        }
        else {
            this.modelViews = [];
            this.modelSpaces = [];
            this.collectionOptions = [];
            this.typeOptions = [];
        }

    }

    getProjectList() {
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100&type=list`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                this.projectChange();

            }

        }, (error) => {
            console.log('error', error);
        });
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    //MODELS
    //DYNAMIC FORM CREATION
    get getModels(): FormArray {
        return this.modelForm.get('models') as FormArray;
    }

    appendModelGroup(item) {
        this.getModels.push(this.createModelGroup(item));
    }

    createModelGroup(item) {
        return this.formBuilder.group({
            name: [item.name ? item.name.trim() : '', [Validators.required]],
            type: [item.type ? item.type.trim() : ''],
            bed: [item.bed ? item.bed : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            bath: [item.bath ? item.bath : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            den: [item.den ? item.den : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            // email: [item.,, Validators.pattern(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)]?item.name:''],
            media: [item.media ? item.media : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            flex: [item.flex ? item.flex : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            ceiling: [item.ceiling ? item.ceiling : '', [Validators.pattern(/^[0-9]\d*(\.\d+)?$/)]],
            collection: [item.collection ? item.collection.trim() : ''],
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
            atrribute_4: [item.atrribute_4 ? item.atrribute_4 : '']
        })
    }

    //GET MODAL LIST
    getModelList() {
        this.spinnerService.show();
        this.saveFilter();
        let data: any = {};
        let url = `inventories/models-list`;
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

        if (this.filterForm.dens.length > 0) {
            const values = this.filterForm.dens.map((ele) => ele.value);
            const valueString = values.join();
            data.den = valueString;
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
        // console.log('data==>', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.modelList = response.results;
                    // this.modelList.forEach(element => {
                    //     element.views = element.views.join();
                    // });
                    if (response.pagination) {
                        this.paginationObj = response.pagination;
                    }
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

    //OPEN ADD MODEL
    openAddModelModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.projectModelList = [];
        this.addModelViews = [];
        this.addModelSpaces = [];
        this.getProjectList(); //calling here to get updated views and spaces. 
        this.formDetails = {
            project_id: this.filterForm.project_id ? this.filterForm.project_id : '',
            views: [],
            spaces: [],
            building_type:'condominium'
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    addModel() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter model name', 'Warning');
            return;
        }
        if (this.isDuplicateModel) {
            this.toastr.warning('Duplicate model name. Please enter another model name', 'Warning');
            return;
        }

        if (!this.formDetails.bed) {
            this.toastr.warning('Please enter number of bedrooms', 'Warning');
            return;
        }
        if (!this.formDetails.bath) {
            this.toastr.warning('Please enter number of bathrooms', 'Warning');
            return;
        }
        if (!this.formDetails.bath) {
            this.toastr.warning('Please enter number of bathrooms', 'Warning');
            return;
        }

        //find selected spaces if size is not mentioned 
        let spaces = this.addModelSpaces.find((element) => element.is_enable && !element.size);
        if (spaces && spaces.is_enable) {
            this.toastr.warning(`Please enter size for ${spaces.name}`, 'Warning');
            return;
        }

        var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
        this.onStatusChange();
        let data = {
            name: this.formDetails.name ? this.formDetails.name : '',
            project_id: this.formDetails.project_id ? this.formDetails.project_id : '',
            project_name: (selectedProject[0] && selectedProject[0].name) ? selectedProject[0].name.trim() : '',
            bed: this.formDetails.bed ? this.formDetails.bed : '',
            bath: this.formDetails.bath ? this.formDetails.bath : '',
            den: this.formDetails.den ? this.formDetails.den : '',
            flex: this.formDetails.flex ? this.formDetails.flex : '',
            area: this.formDetails.area ? this.formDetails.area : '',
            media: this.formDetails.media ? this.formDetails.media : '',
            ceiling: this.formDetails.ceiling ? this.formDetails.ceiling : '',
            outdoor_type: this.formDetails.outdoor_type ? this.formDetails.outdoor_type : '',
            outdoor_area: this.formDetails.outdoor_area ? this.formDetails.outdoor_area : '',
            type: this.formDetails.type ? this.formDetails.type.trim() : '',
            collection: this.formDetails.collection ? this.formDetails.collection.trim() : '',
            is_parking_eligible: this.formDetails.is_parking_eligible ? this.formDetails.is_parking_eligible : '',
            is_locker_eligible: this.formDetails.is_locker_eligible ? this.formDetails.is_locker_eligible : '',
            is_bicycle_eligible: this.formDetails.is_bicycle_eligible ? this.formDetails.is_bicycle_eligible : '',
            notes: this.formDetails.notes ? this.formDetails.notes : '',
            views: this.formDetails.views.length > 0 ? this.formDetails.views : [],
            spaces: this.formDetails.spaces.length > 0 ? this.formDetails.spaces : [],
            building_type:this.formDetails.building_type ? this.formDetails.building_type :''
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
        let url = `inventories/models`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.filterForm.searchText = '';
                    this.isClear = false;
                    this.getModelList();
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

    addViews() {
        if (!this.viewName || !this.viewName.trim()) {
            this.toastr.warning('Please enter view', 'Warning');
            return;
        }
        let returnValue = this.checkExistViewName();
        if (returnValue) {
            return;
        }
        let existingViews = this.addModelViews.map((element) => element.name); //extracting name only
        existingViews.push(this.viewName.trim());
        let data = {
            _id: this.formDetails.project_id,
            views: existingViews
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                // this.getProjectDetails();
                this.viewName ? this.addModelViews.push({ name: this.viewName, is_enable: true }) : true;
                this.onViewChange();
                this.viewName = '';
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    addSpaces() {
        if (!this.spaceName || !this.spaceName.trim()) {
            this.toastr.warning('Please enter space', 'Warning');
            return;
        }
        let returnValue = this.checkExistSpacesName();
        if (returnValue) {
            return;
        }
        let existingSpaces = this.addModelSpaces.map((element) => element.name); //extracting name only
        existingSpaces.push(this.spaceName.trim());
        let data = {
            _id: this.formDetails.project_id,
            spaces: existingSpaces
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.spaceName ? this.addModelSpaces.push({ name: this.spaceName, is_enable: true, size: '' }) : true;
                // this.formDetails.spaces.push({ name: element.name, size: element.size });
                this.spaceName = '';
                setTimeout(() => {
                    const id = this.addModelSpaces.length > 0 ? this.addModelSpaces.length - 1 : 0;
                    let element: HTMLElement = this.renderer.selectRootElement(`#space${id}`);
                    element.focus()
                }, 5);
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //function get called on project change event from add model dialog box 
    projectChange() {
        this.formDetails.name = '';
        this.addModelViews = [];
        this.addModelSpaces = [];
        if (this.formDetails.project_id) { //extracting views and spaces 
            let selectedProject = this.projectList.filter((element) => element._id == this.formDetails.project_id);
            // console.log('projectChange', selectedProject);
            if (selectedProject) {
                let views = selectedProject[0].views ? selectedProject[0].views.length > 0 ? selectedProject[0].views : [] : [];
                let spaces = selectedProject[0].spaces ? selectedProject[0].spaces.length > 0 ? selectedProject[0].spaces : [] : [];
                views.map((element, index) => {
                    this.addModelViews.push({ name: element, is_enable: false });
                })
                spaces.map((element, index) => {
                    this.addModelSpaces.push({ name: element, is_enable: false, size: '' });
                })
                this.getModelsListByProjectId(this.formDetails.project_id); //getting models
            }

        }
    }

    getModelsListByProjectId(projectId: string) {
        this.spinnerService.show();
        let url = `inventories/models?page=${this.page}&pageSize=${this.pageSize}&type=list&project_id=${projectId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectModelList = response.results;
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
    checkExistModelName() {
        let currentModelName = this.formDetails.name;
        let entries = this.projectModelList.map((element) => element.name.trim() == currentModelName.trim());
        this.isDuplicateModel = entries.includes(true) ? true : false;
        if (this.isDuplicateModel) {
            this.toastr.warning('Duplicate model name. Please enter another model name', 'Warning');
            return;
        }
    }

    checkExistSpacesName() {
        let currentSapceName = this.spaceName;
        let entries = this.addModelSpaces.map((element) => element.name.trim() == currentSapceName.trim());
        let isDuplicateSpace = entries.includes(true) ? true : false;
        if (isDuplicateSpace) {
            this.toastr.warning('Duplicate space name. Please enter another space name', 'Warning');

        }
        return isDuplicateSpace;
    }

    checkExistViewName() {
        let currentViewName = this.viewName;
        let entries = this.addModelViews.map((element) => element.name.trim() == currentViewName.trim());
        let isDuplicateView = entries.includes(true) ? true : false;
        if (isDuplicateView) {
            this.toastr.warning('Duplicate view name. Please enter another view name', 'Warning');
        }
        return isDuplicateView;
    }

    onViewChange() {
        this.formDetails.views = [];
        this.addModelViews.forEach(element => {
            if (element.is_enable) {
                this.formDetails.views.push(element.name);
            }
        })
    }

    //IMPORT MODAL
    openImportModal(template: TemplateRef<any>) {
        this.getBuilderList();
        this.importFileModal = {
            project_id: '',
            builder_id: '',
            file: ''
        };
        this.fileChoosed = false;
        this.fileDocument = null;
        this.allowImport = false;
        this.modelForm.patchValue({
            models: []
        })
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    importProjectChange() {
        this.fileDocument = null;
        let selectedImportedProject = this.projectListByBuilder.find((project) => project._id == this.importFileModal.project_id);
        if (selectedImportedProject) {
            if (selectedImportedProject.hasOwnProperty('import_models')) {
                this.allowImport = selectedImportedProject.import_models ? true : false;
                if (!this.allowImport) {
                    this.toastr.warning('Model import is not allowed for this project ', 'Warning');
                }
            }
            else {
                this.allowImport = false;
                this.toastr.warning('Model import is not allowed for this project ', 'Warning');
            }
        }
        else {
            this.toastr.warning('Project not exist', 'Warning');
        }
    }

    getBuilderList() {
        this.spinnerService.show();
        let url = `inventories/builders?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.builderList = response.results;
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

    builderChange() {
        if (this.importFileModal.builder_id) {
            this.getProjectListByBuilder();
        }
        this.importFileModal.project_id = '';
        this.allowImport = false;
    }

    getProjectListByBuilder() {
        this.projectListByBuilder = [];
        this.spinnerService.show();
        let url = `inventories/projects?builder_id=${this.importFileModal.builder_id}&page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectListByBuilder = response.results;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    downloadTemplatefile() {
        let link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = 'assets/templates/model-records-format.xlsx';
        link.download = 'model-template.xlsx';
        document.body.appendChild(link);
        link.click();
        link.remove();
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

    async  onImportFile(template: TemplateRef<any>) {

        if (!this.importFileModal.builder_id) {
            this.toastr.warning('Please select builder', 'Warning');
            return;
        }
        if (!this.importFileModal.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
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
                this.spinnerService.hide();
                this.toastr.warning('Something went wrong ! please upload right file', 'Error');

            });
    }

    //HANDLING RECORDS AFTER IMPORT EXCEL FILE
    async _handleReaderLoaded(template, records) {
        const filteredList = records.filter((element) => element.length > 0);
        const importedData = filteredList.splice(0, 1);
        // console.log('importedData', importedData);
        this.getModels.clear();
        this.filterItems(filteredList).then((res) => {
            this.importRecords = res;
            // console.log('importRecords', this.importRecords);
            this.importRecords.forEach(model => { //CREATNG GROUP CONTROL FOR EACH RECORD
                this.appendModelGroup(model);
            });

            this.modalRef.hide();
            this.fileChoosed = false;
            this.importModalRef = this.modalService.show(template, { class: 'custom-wide-modal modal-xl', backdrop: 'static' });
        })
            .catch((error) => {
                console.log('error', error);
                this.fileChoosed = false;
                this.spinnerService.hide();
                this.toastr.warning('Something went wrong ! please upload correct file', 'Error');
            })

    }

    filterItems(filteredList) {
        return new Promise((resolve, reject) => {
            let data = filteredList.map(arr => {
                let obj: any = {};
                if (arr[0]) {
                    obj.collection = arr[0]
                }
                if (arr[1]) {
                    obj.name = arr[1]
                }
                if (arr[2]) {
                    obj.type = arr[2]
                }
                if (arr[3]) {
                    obj.bed = arr[3]
                }
                if (arr[4]) {
                    obj.bath = arr[4]
                }
                if (arr[5]) {
                    obj.den = arr[5]
                }
                if (arr[6]) {
                    obj.media = arr[6]
                }
                if (arr[7]) {
                    obj.flex = arr[7]
                }
                if (arr[8]) {
                    obj.ceiling = arr[8]
                }
                if (arr[9]) {
                    obj.area = arr[9]
                }
                if (arr[10]) {
                    obj.outdoor_type = arr[10]
                }
                if (arr[11]) {
                    obj.outdoor_area = arr[11]
                }
                if (arr[12]) {
                    obj.views = arr[12]
                }
                if (arr[13]) {
                    obj.spaces = arr[13]
                }
                if (arr[14]) {
                    obj.max_parking = arr[14]
                }
                if (arr[15]) {
                    obj.max_lockers = arr[15]
                }
                if (arr[16]) {
                    obj.max_bicycle = arr[16]
                }
                if (arr[17]) {
                    obj.notes = arr[17]
                }
                if (arr[18]) {
                    obj.atrribute_1 = arr[18]
                }
                if (arr[19]) {
                    obj.atrribute_2 = arr[19]
                }
                if (arr[20]) {
                    obj.atrribute_3 = arr[20]
                }
                if (arr[21]) {
                    obj.atrribute_4 = arr[21]
                }
                return obj;
            })
            resolve(data);
        });
    }

    //API CALL FOR VALIDATED IMPORTED RECORDS
    addImportedFinalRecord() {
        // console.log('models=>', this.modelForm.value.models);
        this.spinnerService.show();
        let slectedBuilder = this.builderList.filter((element) => element._id == this.importFileModal.builder_id)
        let selectedProject = this.projectListByBuilder.filter((element) => element._id == this.importFileModal.project_id)
        this.filterModels(this.modelForm.value.models).then((filteredModels: any) => {
            if (filteredModels && filteredModels.length > 0) {
                filteredModels.forEach(model => {
                    model.builder_id = this.importFileModal.builder_id;
                    model.project_id = this.importFileModal.project_id;
                    model.builder_name = slectedBuilder[0].name ? slectedBuilder[0].name : '';
                    model.project_name = selectedProject[0].name ? selectedProject[0].name : '';
                    model.building_type=model.building_type ? model.building_type :''

                    if (model.views) {
                        if ((model.views.indexOf('/')) != -1) {
                            let views = model.views.split('/');
                            let trimedViews = [];
                            views.forEach((view) => {
                                trimedViews.push(view.trim());

                            });
                            model.views = trimedViews;
                        }
                        else if ((model.views.indexOf(',')) != -1) {
                            let views = model.views.split(',');
                            let trimedViews = [];
                            views.forEach((view) => {
                                trimedViews.push(view.trim());

                            });
                            model.views = trimedViews;
                        }
                        else {
                            let views = model.views.split(',');
                            model.views = views.length > 0 ? views : [];
                        }

                    }

                    if (model.spaces) {
                        //extracting values of name and size from the space string
                        let spacesArray = [];
                        if ((model.spaces.indexOf('/')) != -1) {
                            spacesArray = model.spaces.split("/");
                        }
                        else if ((model.spaces.indexOf(',')) != -1) {
                            spacesArray = model.spaces.split(",");
                        }

                        let newSpaces = [];
                        if (spacesArray) {
                            spacesArray.forEach(ele => {
                                let model_ = ele.trim();
                                const singleSpaceArray = model_.split(' ');
                                let obj = {};
                                obj['name'] = singleSpaceArray[0] ? singleSpaceArray[0].trim() : '';
                                obj['size'] = singleSpaceArray[1] ? parseFloat(singleSpaceArray[1]) : '';
                                newSpaces.push(obj);
                            });
                        }
                        model.spaces = newSpaces;
                    }

                    // conditions for max parkings eligible flag
                    model['is_parking_eligible'] = model.max_parking > 0 ? true : false;
                    model['is_locker_eligible'] = model.max_lockers > 0 ? true : false;
                    model['is_bicycle_eligible'] = model.max_bicycle > 0 ? true : false

                });
                // console.log('filteredModels', filteredModels);
                // API call for sending records to server
                let data = { 'records': filteredModels };
                let url = `inventories/models-import`; //for unit unit-import
                this.webService.post(url, data).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.importRecords = [];
                            this.importModalRef.hide();
                            this.clearModelBulkEditModal();
                            this.getModelList();
                            this.toastr.success(response.message, 'Success');
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
        }).catch((error) => {
            console.log('error', error);
            this.toastr.warning('Sorry something went wrong', 'Error');

        });
    }

    filterModels(filteredList) {
        return new Promise((resolve, reject) => {
            let data = filteredList.map((key) => {
                let obj: any = {};
                if (key.collection) {
                    obj.collection = key.collection
                }
                if (key.name) {
                    obj.name = key.name
                }
                if (key.type) {
                    obj.type = key.type
                }
                if (key.bed) {
                    obj.bed = parseFloat(key.bed)
                }
                if (key.bath) {
                    obj.bath = parseFloat(key.bath)
                }
                if (key.den) {
                    obj.den = parseFloat(key.den)
                }
                if (key.media) {
                    obj.media = parseFloat(key.media)
                }
                if (key.flex) {
                    obj.flex = parseFloat(key.flex)
                }
                if (key.ceiling) {
                    obj.ceiling = parseFloat(key.ceiling)
                }
                if (key.area) {
                    obj.area = parseFloat(key.area)
                }
                if (key.outdoor_type) {
                    obj.outdoor_type = key.outdoor_type
                }
                if (key.outdoor_area) {
                    obj.outdoor_area = parseFloat(key.outdoor_area)
                }
                if (key.views) {
                    obj.views = key.views
                }
                if (key.spaces) {
                    obj.spaces = key.spaces
                }
                if (key.max_parking) {
                    obj.max_parking = parseFloat(key.max_parking)
                }
                if (key.max_lockers) {
                    obj.max_lockers = parseFloat(key.max_lockers)
                }
                if (key.max_bicycle) {
                    obj.max_bicycle = parseFloat(key.max_bicycle)
                }
                if (key.notes) {
                    obj.notes = key.notes
                }
                if (key.atrribute_1) {
                    obj.atrribute_1 = key.atrribute_1
                }
                if (key.atrribute_2) {
                    obj.atrribute_2 = key.atrribute_2
                }
                if (key.atrribute_3) {
                    obj.atrribute_3 = key.atrribute_3
                }
                if (key.atrribute_4) {
                    obj.atrribute_4 = key.atrribute_4
                }
                return obj;
            })
            resolve(data);
        });
    }

    clearModelBulkEditModal() {
        this.getModels.clear();
    }


    /////OTHER SUB ACTIONS////

    //on clear action filter will get clear
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.filterForm.beds = [];
        this.filterForm.baths = [];
        this.filterForm.dens = [];
        this.filterForm.views = [];
        this.filterForm.spaces = [];
        this.filterForm.media = [];
        this.filterForm.flex = [];
        this.filterForm.ceiling = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        this.getModelList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            // project_id: this.filterForm.project_id,
            beds: this.filterForm.beds,
            baths: this.filterForm.baths,
            dens: this.filterForm.dens,
            views: this.filterForm.views,
            spaces: this.filterForm.spaces,
            media: this.filterForm.media,
            flex: this.filterForm.flex,
            ceiling: this.filterForm.ceiling,
            collection: this.filterForm.collection,
            type: this.filterForm.type
        }
        localStorage.setItem('inventoriesModelFilterData', JSON.stringify(data));
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getModelList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getModelList();
    }

    //PAGINATION
    setPageSize() {
        this.page = 1;
        this.getModelList();
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
        this.getModelList();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getModelList();
    }

    onStatusChange() {
        this.formDetails.spaces = [];
        this.addModelSpaces.forEach(element => {
            if (element.is_enable && element.size) {
                this.formDetails.spaces.push({ name: element.name, size: element.size });
            }
        })
    }

    //FILTERS 
    onItemSelect() {
        this.page = 1;
        this.getModelList();
    }

    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getModelList();
    }
    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getModelList();
    }


    //NAVIGATE TO MODEL DETIALS PAGE
    goToModelDetails(item) {
        this.router.navigate(['inventories/model/' + item._id]);
    }



}
