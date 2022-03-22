import { Component, OnInit, TemplateRef, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { Subscription, Observable } from 'rxjs';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { fabric } from "fabric";

@Component({
    selector: 'app-checklist-tab',
    templateUrl: './checklist-inspection.component.html',
    styleUrls: ['./checklist-inspection.component.css']
})
export class ChecklistInspectionComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    paginationObj: any = {};
    filterForm: any = {
        searchText: '',
        startDate: '',
        endDate: '',
        project_id: ''
    };
    selectedAll: boolean = false;
    formDetails: any = {};
    sortedtby: any = '';
    sortOrder: any = '';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '';
    reverse: boolean = true;
    isClear: boolean = false;
    unitList: any = [];
    projectList: any = [];
    checkList: any[] = [];
    settingsCheckList: any[] = [];
    locationList: any[] = [];
    modalRef: BsModalRef;
    levelList: any[] = [];
    isNext: boolean = false;
    failedmodalRef: BsModalRef;
    deficiencyModalRef: BsModalRef;
    selectedItem: any = {};
    assigneeTradeList: any = [];
    approverList: any = [];
    attachments: any[] = [];
    inceptionTypeList: any[] = [];
    priorityList: any[] = [];
    isBulkAssign: boolean = false;
    inspectionData: any = {};
    deficiencyData: any = {};
    scheduleImpacted: any = ['Yes', ' Yes (Unknown)', 'No', ' Not Sure', ' N/A'];
    costImpacted: any[] = ['Yes', 'Yes (Unknown)', 'No', 'Not Sure', 'N/A'];
    inspectionDetails:any[]=[];
    @ViewChild('inspectionSlider') inspectionSlider: ElementRef;
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();
    searchQuery: string = '';
    tagListSuggestions:any[]=[];
    tagList:any=[]
    typeOfDeficiencyList:any=[];
    minDueDate:any;
    canvas: any;
    context: any;
    imageCanvasRef: BsModalRef;
    currentImageIndex: number;
    isEditImage: boolean = false;
    checkListCategory:any=[];
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.getProjectList();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.filterForm.project_id = response._id;
                this.onProjectChange();
            }
            else {
                this.filterForm.project_id = '';
                this.onProjectChange();
            }
        });

        let mendDate = moment().startOf('month').format('YYYY-MM-DD');
        this.minDueDate= new Date(mendDate);

    }

    //NON INLINE EDITOR OPTIONS
    public nonInlineEdit: Object = {
        attribution: false,
        heightMax: 200,
        charCounterCount: false,
        pasteDeniedTags: ['img'],
        videoInsertButtons:['videoBack', '|', 'videoByURL', 'videoEmbed'],
        toolbarButtons: {
            'moreText': {

                'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
                'buttonsVisible': 4
            
              },
            
              'moreParagraph': {
            
                'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'],
                'buttonsVisible': 2
            
              },
            
              'moreRich': {
            
                'buttons': ['insertLink', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertHR'],
                'buttonsVisible': 2
            
              },
            
              'moreMisc': {
            
                'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
            
                'align': 'right',
            
                'buttonsVisible': 2
            
              }
            
            },
        key: "te1C2sB5C7D5G4H5B3jC1QUd1Xd1OZJ1ABVJRDRNGGUE1ITrE1D4A3A11B1B6B5B1F4F3==",
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('serviceProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData._id) {
                this.filterForm.project_id = projectData._id;
            }
            else {
                this.filterForm.project_id = this.projectList.length>0 ? this.projectList[0]._id :'';
                let data = {
                    project_id: this.filterForm.project_id,
                }
                this.projectChanged.emit(data);
            }
        }
        else {
            this.filterForm.project_id = this.projectList.length>0 ? this.projectList[0]._id :'';
            let data = {
                project_id: this.filterForm.project_id,
            }
            this.projectChanged.emit(data);
        }

        let filterData: any = localStorage.getItem('checklistFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);

            // if (filterData.location) {
            //     this.filterForm.location = filterData.location;
            // }
            // else {
            //     this.filterForm.location = this.locationList[0].name;
            // }
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
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
            // if (filterData.date_filter) {
            //     this.filterForm.date_filter = filterData.date_filter;
            // }
            // if (filterData.startDate) {
            //     this.filterForm.startDate = filterData.startDate;
            // }
            // if (filterData.endDate) {
            //     this.filterForm.endDate = filterData.endDate;
            // }

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        // this.getLocationList();
        this.getPriorityList();

        this.getCheckList();

    }

    onProjectChange() {
        this.getCheckList();
        this.getLocationList();
        this.getPriorityList();
    }
    getLocationList() {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-LOCATION`;
        let url = `service/project-settings?type=PROJECT-ISSUE-LOCATION&page=1&pageSize=200&sortBy=order&sortOrder=ASC`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.locationList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getCheckList() {
        // if (!this.filterForm.project_id) {
        //     this.toastr.warning('Please select project!', 'Warning');
        //     return false;
        // }
        this.saveFilter();
        let url = `service/inspections?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.checkList = response.results ? response.results : [];
                    this.checkList.forEach(element => {
                        element.selected = false;
                    });
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    doPaginationWise(page) {
        this.page = page;
        this.getCheckList();
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getCheckList();
    }

    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';

        this.getCheckList();
    }

    setPageSize() {
        this.page = 1;
        this.getCheckList();
    }
    

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            date_filter: '',
            startDate: '',
            endDate: ''
        };
        this.isClear = false;
        this.getCheckList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            location: this.filterForm.location
            // startDate: this.filterForm.startDate,
            // endDate: this.filterForm.endDate,
            // project_id: this.filterForm.project_id
        }
        localStorage.setItem('checklistFilterData', JSON.stringify(data));
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
        this.getCheckList();
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `service/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                setTimeout(() => {
                    this.getSavedFilterdata();
                }, 1000)
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openChecklistWalkthroughModal(template: TemplateRef<any>) {
        this.formDetails = {
            start_time: new Date(),
            date: new Date()
        };
        this.isNext = false;
        this.getCheckCategoryList();
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.formDetails.project_id = this.filterForm.project_id || '';

        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    onFormProjectChange(){
        this.formDetails.unit={
            unit_id:'',
            unit_no:''
        }
    }

    getUnits(event) {
        // console.log('event', event)
        let url = `service/units?project_id=${this.formDetails.project_id}&searchText=${event.query ? event.query : this.formDetails.unit}`;
        this.webService.get(url).subscribe((response: any) => {
        if (response.is_valid_session) {
            if (response.status == 1) {
            if (response.results) {
                this.unitList = [...response.results];
               
            } else {
                this.unitList = [];
            }
            } else {
            this.toastr.error(response.message, 'Error!');
            }
        } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login']);
        }
        }, (error) => {
        console.log('error', error);
        });
    }

    unitSelection(val) {
        // console.log('val', val);
        this.formDetails.unit_id = val._id;
    }

    autocompleteNumber(event) {
        // console.log(event);
            if(!event){
            this.formDetails.unit={
                unit_id:'',
                unit_no:''
            };
        }
    }

    // onBuildingTypeChange(){
    //     this.formDetails.level='';
    //     this.formDetails.unit_id='';
    //     this.formDetails.unit_no= '';
    
    //     if(this.formDetails.building_type=='condominium'){
    //         this.getLevelsFromProject(this.filterForm.project_id);
    //     }
    //     else{
    //         this.getUnitList(this.filterForm.project_id,this.formDetails.building_type);
    //     }
    // }

    // getLevelsFromProject(project) {
    //     this.levelList = [];
    //     this.spinnerService.show();
    //     let url = `service/projects?_id=${project}`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.status == 1) {
    //             let data = response.result;
    //             // let levels = data.no_of_floors ? data.no_of_floors : 0;
    //             let info = data.additional_info ? data.additional_info.find((item)=>item.type=='condominium'):{};
    //             let levels = (info.type && info.total_floors ) ? info.total_floors : 0;
    //             for (let i = 1; i <= levels; i++) {
    //                 this.levelList.push(i);
    //             }
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }

    // onLevelChange() {
    //     this.formDetails.unit_id='';
    //     this.formDetails.unit_no= '';
    //     this.getUnitList(this.filterForm.project_id);
    // }

    getTemplateCheckList() {
        this.spinnerService.show();
        let url = `service/checklist-templates?project_id=${this.filterForm.project_id}&location=${this.formDetails.location}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.settingsCheckList = response.results;
                this.getCheckItemList();
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onLocationChange() {
        if(this.formDetails.location == this.locationList[this.locationList.length -1].name){
            this.formDetails.end_time= new Date();
        }
        this.getTemplateCheckList();
    }

    getUnitList(project_id,building_type?) {
        this.spinnerService.show();
        let url = `service/units?project_id=${project_id}`;
        if (this.formDetails.level) {
            url = url + `&floor=${this.formDetails.level}`;
        }
        if(building_type){
            url = url + `&building_type=${building_type}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitList = response.results ? response.results : [];
                    this.formDetails.unit_id = '';
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    nextLocation() {
        let currentRecord = this.locationList.findIndex((ele) => ele.name == this.formDetails.location);
        if (currentRecord != undefined) {
            if (currentRecord == (this.locationList.length - 1)) {
                this.formDetails.location = this.locationList[0].name;
            }
            else {
                this.formDetails.location = this.locationList[currentRecord + 1].name;
            }
            if(this.formDetails.location == this.locationList[this.locationList.length -1]?.name){
                this.formDetails.end_time= new Date();
            }
            this.getTemplateCheckList();

        }
    }

    selectAll() {
        for (var i = 0; i < this.unitList.length; i++) {
            this.unitList[i].selected = this.selectedAll;
        }
        // this.onChangeDeleteCheckbox();
    }

    onNextAction() {
        // if(this.formDetails.building_type=='condominium'){
        //     if (!this.formDetails.level) {
        //         this.toastr.warning('Please select floor', 'Warning');
        //         return;
        //     }
        // }
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.unit_id) {
            this.toastr.warning('Please select unit', 'Warning');
            return;
        }
        if (!this.formDetails.date) {
            this.toastr.warning('Please select date', 'Warning');
            return;
        }
        if (!this.formDetails.start_time) {
            this.toastr.warning('Please select start time', 'Warning');
            return;
        }
        // if (this.locationList.length == 0) {
        //     this.toastr.warning('Please add locations for the selected project', 'Warning');
        //     return;
        // }
        if (!this.formDetails.checklist_id) {
            this.toastr.warning('Please select checklist', 'Warning');
            return;
        }
        if (this.priorityList.length == 0) {
            this.toastr.warning('Please add priorities for the selected project', 'Warning');
            return;
        }
        let selectedUnit = this.unitList.find((ele) => ele._id == this.formDetails.unit_id);
        this.formDetails.unit_no = selectedUnit ? selectedUnit.unit_no : '';
        let selectedProject = this.projectList.find((data) => data._id == this.formDetails.project_id);
        let selectedChecklist = this.checkListCategory.find((data) => data._id == this.formDetails.checklist_id);

        let time = moment(this.formDetails.start_time).format('HH:mm');
        // this.formDetails.location = this.filterForm.location;
        let data: any = {
            date: moment(this.formDetails.date).format('YYYY-MM-DD'),
            project_id: this.formDetails.project_id,
            project_name: selectedProject ? selectedProject.name : '',
            start_time: time,
            // location: this.formDetails.location,
            unit_no: this.formDetails.unit_no,
            unit_id: this.formDetails.unit_id,
            checklist_id:this.formDetails.checklist_id,
            checklist_name:selectedChecklist? selectedChecklist.name:''
        }
        // data.building_type= this.formDetails.building_type || '';
        // if(this.formDetails.building_type=='condominium'){
        //     data.floor= this.formDetails.level
        // }
        // else{
        //     data.floor= '';
        // }
        this.spinnerService.show();
        // console.log('onNextAction', data);
        let url = `service/inspections`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.inspectionData = response.result;
                    this.formDetails.location = this.locationList.length > 0 ? this.locationList[0].name : '';
                    this.isNext = true;
                    // this.getTemplateCheckList();
                    this.formDetails.checklist_id=this.formDetails.checklist_id;
                    this.formDetails.end_time= new Date();
                    this.formDetails.checklist_name=selectedChecklist.name? selectedChecklist.name:''
                    this.onCategoryChange();
                    setTimeout(()=>{
                        this.getCheckItemList();
                    },1000)
                    this.toastr.success(response.message, 'Success');
                }
                else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getCheckCategoryList(){
        this.spinnerService.show();
        let url = `service/checklists`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.checkListCategory = response.results;
    
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `service` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onCategoryChange(){
    let url = `service/checklist-categories?checklist_id=${this.formDetails.checklist_id}`;
    if(this.formDetails.checklist_id){
            this.spinnerService.show();
            let selectedItem= this.checkListCategory.find((ele)=>ele._id==this.formDetails.checklist_id);
            selectedItem.categories=[];
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        let data= response.results ?response.results :[];
                        selectedItem.categories=data;
                        selectedItem.categories.forEach(category => {
                            let items=[];
                            if(category && category.items){
                                category.items.forEach(item => {
                                    let object={
                                        value:item
                                    }
                                    items.push(object);
                                });
                            }
                            category.items=items;
                        });

                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: `service` } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else{
            this.checkListCategory.forEach(element => {
                element.items=[];
            });
        }
    }

    // oldonPassAction(item) {
    //     let itemObject: any = {
    //         name: item.title,
    //         template_id: item._id,
    //         inspection_id: this.inspectionData._id,
    //         location: this.formDetails.location,
    //         status: 'PASSED',
    //     }
    //     let inspections: any[] = [];
    //     inspections.push(itemObject);
    //     // console.log('onPassAction', inspections);
    //     let finalpayload = {
    //         items: inspections
    //     }
    //     this.spinnerService.show();
    //     let url = `service/inspection-items`;
    //     this.webService.post(url, finalpayload).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.success) {
    //             if (response.status == 1) {
    //                 this.getCheckItemList();
    //                 this.toastr.success(response.message, 'Success');
    //             }
    //             else {
    //                 this.toastr.error(response.message, 'Error');
    //             }
    //         } else {
    //             this.toastr.error(response.message, 'Error');
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });

    // }

    // oldonFailedAction(template: TemplateRef<any>) {
    //     if (!this.selectedItem.potential_issue) {
    //         this.toastr.warning('Please select potential issue', 'Warning');
    //         return;
    //     }

    //     this.spinnerService.show();
    //     let data: any = {
    //         name: this.selectedItem.title,
    //         template_id: this.selectedItem._id,
    //         inspection_id: this.inspectionData._id,
    //         location: this.formDetails.location,
    //         status: 'FAILED',
    //         potential_issue: this.selectedItem.potential_issue,
    //         notes: this.selectedItem.note
    //     }

    //     let inspections: any[] = [];
    //     inspections.push(data);
    //     let finalpayload = {
    //         items: inspections
    //     }
    //     let url = `service/inspection-items`;
    //     this.webService.post(url, finalpayload).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.success) {
    //             if (response.status == 1) {
    //                 this.getCheckItemList(template);
    //                 this.failedmodalRef.hide();
    //                 this.toastr.success(response.message, 'Success');
    //             }
    //             else {
    //                 this.toastr.error(response.message, 'Error');
    //             }
    //         } else {
    //             this.toastr.error(response.message, 'Error');
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }

    ////   ACTIONS    //////
    onPassAction(category,item){
    let data={
        checklist_id:this.formDetails.checklist_id,
        category_name:category.name,
        category_id:category._id,
        item_name:item.value ||'',
        inspection_id: this.inspectionData._id,
        status: 'PASSED',
    }

    if(item._id){
        data['_id']=item._id
    }
        let inspections: any[] = [];
        inspections.push(data);
        let finalpayload = {
            items: inspections
        }
        this.spinnerService.show();
        let url = `service/inspection-items`;
        this.webService.post(url, finalpayload).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.getCheckItemList();
                    this.toastr.success(response.message, 'Success');
                }
                else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    
    onFailedAction(category,item){
        let data={
            checklist_id:this.formDetails.checklist_id,
            category_name:category.name,
            category_id:category._id,
            item_name:item.value ||'',
            inspection_id: this.inspectionData._id,
            status: 'FAILED',
        }

        if(item._id){
            data['_id']=item._id
        }
            let inspections: any[] = [];
            inspections.push(data);
            let finalpayload = {
                items: inspections
            }
            this.spinnerService.show();
            let url = `service/inspection-items`;
            this.webService.post(url, finalpayload).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success) {
                    if (response.status == 1) {
                        this.getCheckItemList();
                        this.toastr.success(response.message, 'Success');
                    }
                    else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
    }

    onNAAction(category,item){
        let data={
            checklist_id:this.formDetails.checklist_id,
            category_name:category.name,
            category_id:category._id,
            item_name:item.value ||'',
            inspection_id: this.inspectionData._id,
            status: 'N/A',
        }
        if(item._id){
            data['_id']=item._id
        }
            let inspections: any[] = [];
            inspections.push(data);
            let finalpayload = {
                items: inspections
            }
            this.spinnerService.show();
            let url = `service/inspection-items`;
            this.webService.post(url, finalpayload).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success) {
                    if (response.status == 1) {
                        this.getCheckItemList();
                        this.toastr.success(response.message, 'Success');
                    }
                    else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
    
    }

    onAddDeficiencyAction(category,item,template: TemplateRef<any>){
        // console.log('item',item);
        this.deficiencyData = {
            project_id: this.formDetails.project_id,
            project_name: this.formDetails.project_name,
            unit_no: this.formDetails.unit_no,
            // location: '',
            title: category.name  + ' - ' + (item.value ||''),
            unit_id: this.formDetails.unit_id,
            // inspection_item_id: updatedElement ? updatedElement._id : '',
            description: '',
            tags: [],
            deficiency_type: '',
            charge_back: '',
            assignee_id:'',
            approver_id:'',
            checklist_id:this.formDetails.checklist_id,
            category_name:category.name,
            category_id:category._id,
            inspection_id: this.inspectionData._id,
          };
          this.deficiencyData.inspection_type = localStorage.getItem('definspectionType') ? localStorage.getItem('definspectionType') : '';
          this.deficiencyData.priority = localStorage.getItem('defPriority') ? localStorage.getItem('defPriority') : '';    
          this.deficiencyData.due_date = localStorage.getItem('defDueDate') ? moment(localStorage.getItem('defDueDate')).format('YYYY-MM-DD') : '';    
  
          this.currentImageIndex = undefined;
          this.isEditImage = false;
          this.attachments = [];
          this.getUnitList(this.inspectionData.project_id);
          this.getPriorityList();
          this.getLocationList();
          this.getTypeOfDeficiencyList(this.inspectionData.project_id);
          this.getTagsList(this.inspectionData.project_id);
          this.getApproverList(this.inspectionData.project_id);
          this.getAssigneeTrade(this.inspectionData.project_id);
          this.getInspectionTypeList(this.inspectionData.project_id);

        //   console.log(this.deficiencyData);
          this.deficiencyModalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    //GET CALLED ON CHANGE OF STATUS FROM PASS TO FAILED FROM ADD ISSUE MODAL
    onPassToFailedChangeAction(template: TemplateRef<any>){
        if (!this.selectedItem.potential_issue) {
            this.toastr.warning('Please select potential issue', 'Warning');
            return;
        }

        let data: any = {
            _id: this.selectedItem._id,
            status: 'FAILED',
            potential_issue: this.selectedItem.potential_issue,
            notes: this.selectedItem.note ?this.selectedItem.note :''
        }

        let inspections: any[] = [];
        inspections.push(data);
        let finalpayload = {
            items: inspections
        }
        // console.log('data', data);
        this.spinnerService.show();
        let url = `service/inspection-items`;
        this.webService.post(url, finalpayload).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.getChecklistItem(this.inspectionData,template);
                    this.failedmodalRef.hide();
                    this.toastr.success(response.message, 'Success');
                }
                else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    getCheckItemList(template?: TemplateRef<any>) {
        this.spinnerService.show();
        let url = `service/inspection-items?inspection_id=${this.inspectionData._id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    if (response.results && response.results.length > 0) {
                        let updatedItems = response.results.filter(element => (element.status == 'PASSED' || element.status == 'FAILED' ||  element.status == 'N/A'));
                        console.log('updatedItems',updatedItems);
                        
                        updatedItems.forEach(updatedElement => {
                            this.checkListCategory.forEach((element) => {
                                if(element.categories && element._id == updatedElement.checklist_id){
                                    element.categories.forEach(category => {
                                        if(category._id ==updatedElement.category_id){
                                            category.items.forEach(item => {
                                                if(item.value==updatedElement.item_name){
                                                    item.status = updatedElement.status;
                                                    item._id=updatedElement._id
                                                }
                                            });
                                        }
                                    });
                                }
                            })
                            // console.log('checkListCategory',this.checkListCategory);
                        });
                        this.checkListCategory.forEach((element) => {
                            if(element && element.categories){
                                element.categories.forEach(category => {
                                        let records= response.results.filter((item)=>item.category_id==category._id);
                                        let passed=records.filter(element => element.status == 'PASSED');
                                        let failed=records.filter(element => element.status == 'FAILED');
                                        let na=records.filter(element => element.status == 'N/A');
                                        let total=category.items.length;
                                        category.passed=passed.length;
                                        category.failed=failed.length;
                                        category.na=na.length;
                                        category.total=total;
                                });
                            }
                            
                        })
                    }
                    else{
                        this.checkListCategory.forEach((element) => {
                            if(element && element.categories){
                                element.categories.forEach(category => {
                                    let records= response.results.filter((item)=>item.category_id==category._id);
                                        let passed=records.filter(element => element.status == 'PASSED');
                                        let failed=records.filter(element => element.status == 'FAILED');
                                        let na=records.filter(element => element.status == 'N/A');
                                        let total=category.items.length;
                                        category.passed=passed.length;
                                        category.failed=failed.length;
                                        category.na=na.length;
                                        category.total=total;
                                });
                            }
                            
                        })
                 
                    }
        
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openFailedModal(template: TemplateRef<any>, item) {
        this.selectedItem = Object.assign({}, { ...item });
        this.selectedItem.inspection_type = localStorage.getItem('definspectionType') ? localStorage.getItem('definspectionType') : '';
        this.selectedItem.priority = localStorage.getItem('defPriority') ? localStorage.getItem('defPriority') : '';    
        this.selectedItem.due_date = localStorage.getItem('defDueDate') ? moment(localStorage.getItem('defDueDate')).format('YYYY-MM-DD') : '';    
        this.failedmodalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    onCompleteAction() {
        if (!this.formDetails.end_time) {
            this.toastr.warning('Please select end time', 'Warning');
            return;
        }

        this.spinnerService.show();
        let data: any = {
            _id: this.inspectionData._id,
            status: 'COMPLETE',
            end_time: moment(this.formDetails.end_time).format('HH:mm')
        }
        // let inspections: any[] = [];
        // inspections.push(data);
        // let finalpayload = {
        //     items: inspections
        // }
        // console.log('data', data);
        let url = `service/inspections`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.getCheckList();
                    this.modalRef.hide();
                    this.toastr.success(response.message, 'Success');
                }
                else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onPassAll() {
        let items = [];
        this.settingsCheckList.forEach(item => {
            if (!item.status || (item.status != 'PASSED' && item.status != 'FAILED')) {
                let data: any = {
                    name: item.title,
                    template_id: item._id,
                    inspection_id: this.inspectionData._id,
                    location: this.formDetails.location,
                    status: 'PASSED'
                }
                items.push(data);
            }
        })
        if (items.length > 0) {
            let finalpayload = {
                items: items
            }
            // console.log('data', finalpayload);
            this.spinnerService.show();
            let url = `service/inspection-items`;
            this.webService.post(url, finalpayload).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success) {
                    if (response.status == 1) {
                        this.getCheckItemList();
                        this.toastr.success(response.message, 'Success');
                    }
                    else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }
        else {
            this.toastr.warning('No item is available to pass', 'Warning');
            return;
        }
    }

    // addAttachment(files) {
    //     if (files.length > 0) {
    //         const totalFiles = files.length;
    //         let validation = false;
    //         for (let i = 0; i < totalFiles; i++) {
    //             let photo = files[i];
    //             validation = this.validatePhoto(photo.name);
    //         }
    //         if (validation) {
    //             this.attachments = [...files, ...this.attachments];
    //         } else {
    //             this.toastr.error("Please upload only JPG, PNG, JPEG, PDF, DOC, DOCX format", 'Error');
    //         }

    //     }
    // }

    uploadImage(event, template: TemplateRef<any>) {
        if (event.files && event.files.item(0)) {
          let validation = this.validatePhoto(event.files.item(0).name);
          if (validation) {
            // this.uploadedImages.push(event.files.item(0));
            this.getBase64(event.files.item(0), template);
          } else {
            this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
          }
        }
    }

    //FILE UPLAOD TO BASE64 CONVERSION
    getBase64(file, template) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
        // this.imageStrip.push(reader.result);
        this.openImageEditorModal(reader.result, false, template)
        // this.inputImg.nativeElement.value = "";
        // console.log('this.formDetails.layout', this.formDetails.layout);
        };
        reader.onerror = function (error) {
        console.log("Error: ", error);
        };
    }

    onChangeDeleteCheckbox() {
        let records = this.checkList.filter(element => element.selected == true);
        if (records.length > 0) {
            this.isBulkAssign = true;
        }
        else {
            this.isBulkAssign = false;
            this.selectedAll = false;
        }
    }

    openAddDeficiencyModal(selectedItem, template: TemplateRef<any>, updatedItem) {
        this.deficiencyData = {
            project_id: this.filterForm.project_id,
            project_name: this.filterForm.project_name,
            unit_no: this.formDetails.unit_no,
            location: this.formDetails.location,
            title: selectedItem.title,
            unit_id: this.formDetails.unit_id,
            inspection_item_id: updatedItem ? updatedItem._id : '',
            description: updatedItem.notes ? updatedItem.notes : '',
            inspection_type: this.selectedItem.inspection_type || '',
            priority: this.selectedItem.priority || '',
            due_date: this.selectedItem.due_date || '',
            tags: [],
            deficiency_type: '',
            charge_back: '',
            assignee_id:'',
            approver_id:''
        };
        // console.log(data, this.deficiencyData)
        this.currentImageIndex = undefined;
        this.isEditImage = false;
        this.attachments = [];
        this.getApproverList(this.filterForm.project_id);
        this.getAssigneeTrade(this.filterForm.project_id);
        this.getTagsList(this.filterForm.project_id);
        this.getTypeOfDeficiencyList(this.filterForm.project_id);
        this.deficiencyModalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    openModal(template: TemplateRef<any>) {
        this.formDetails = {
            project_id: this.filterForm.project_id
        };
        this.attachments = [];
        this.getApproverList(this.filterForm.project_id);
        this.getAssigneeTrade(this.filterForm.project_id);
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    getAssigneeTrade(project) {
        if (!project) {
            this.toastr.warning('Please select project!', 'Warning');
            return false;
        }
        let url = `service/users?project_id=${project}&role=TRADE`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.assigneeTradeList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });

    }

    getApproverList(project) {
        if (!project) {
            this.toastr.warning('Please select project!', 'Warning');
            return false;
        }
        let url = `service/users?project_id=${project}&role=APPROVER`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.approverList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });

    }

    addDeficiency() {
        if (!this.deficiencyData.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.deficiencyData.unit_id) {
            this.toastr.warning('Please select unit', 'Warning');
            return;
        }
        if (!this.deficiencyData.title) {
            this.toastr.warning('Please enter title', 'Warning');
            return;
        }
        if (!this.deficiencyData.inspection_type) {
            this.toastr.warning('Please select inspection type', 'Warning');
            return;
        }
        // if (!this.deficiencyData.location) {
        //     this.toastr.warning('Please select location', 'Warning');
        //     return;
        // }
        if (!this.deficiencyData.priority) {
            this.toastr.warning('Please select priority', 'Warning');
            return;
        }
        if (!this.deficiencyData.due_date) {
            this.toastr.warning('Please select due date', 'Warning');
            return;
        }
        // if (!this.deficiencyData.tags || this.deficiencyData.tags.length == 0) {
        //     this.toastr.warning('Please select tags', 'Warning');
        //     return;
        // }
        if (!this.deficiencyData.deficiency_type) {
            this.toastr.warning('Please select deficiency type', 'Warning');
            return;
        }

        let data: any = Object.assign({},this.deficiencyData);
        if (this.deficiencyData.assignee_id) {
            let selectedAssignee = this.assigneeTradeList.find((record) => record.user_id == this.deficiencyData.assignee_id);
            data.assignee_name = selectedAssignee.display_name;
        }
        else {
            delete data.assignee_id;
        }
        if (this.deficiencyData.approver_id) {
            let selectedApprover = this.approverList.find((record) => record.user_id == this.deficiencyData.approver_id);
            data.approver_name = selectedApprover.display_name;
        }
        else {
            delete data.approver_id;
        }
        let tags = [];
        if (this.deficiencyData.tags && this.deficiencyData.tags.length > 0) {
            this.deficiencyData.tags.forEach(element => {
                tags.push(element.name);
            });
        }
        let selectedUnit = this.unitList.find((record) => record._id == this.deficiencyData.unit_id);
        let selectedProject = this.projectList.find((record) => record._id == this.deficiencyData.project_id);
        data.unit_no = selectedUnit ? selectedUnit.unit_no : '';
        data.due_date = moment(this.deficiencyData.due_date).format('YYYY-MM-DD');
        data.project_name = selectedProject ? selectedProject.name : '';
        data.status = 'Open';
        data.tags = tags;
        // data.inspection_item_id = this.deficiencyData.inspection_item_id;

        let url = `service/deficiencies`;
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.storeInspectionType();
                    this.storePriority();
                    this.storeDueDate();
                    this.toastr.success(response.message, 'Success');
                    if (this.attachments && this.attachments.length > 0) {
                        // console.log('attachments', this.attachments);
                        this.uploadAttachment(this.attachments, response.result._id);
                    }
                    else {
                        // this.getDeficiencies();
                        this.deficiencyModalRef.hide();
                    }
                }
                else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }


    //// AUTO COMPLETE FIELD OF TAGS ///
    onDropdownClick() {
        this.searchQuery = '';
    }

    appendNewElement(){
        if (this.searchQuery && this.searchQuery.length > 3) {
            let item = this.tagList.find((tag) => tag.name == this.searchQuery);
            // console.log('event query', this.searchQuery, item);
            if (item) {
                return;
            }
            let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
            let data: any = {
                type: "PROJECT-ISSUE-TAG",
                name: this.searchQuery.trim(),
                project_id: this.filterForm.project_id,
                project_name: selectedProject ? selectedProject.name : ''

            };
            // console.log('data =>', data);
            this.spinnerService.show();
            let url = `service/project-settings`;
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.tagListSuggestions.push({ name: data.name, _id: '' });
                    if (this.deficiencyData.tags && this.deficiencyData.tags.length > 0) {
                        let oldRecords = [...this.deficiencyData.tags];
                        this.deficiencyData.tags = [...oldRecords];
                    }
                    else {
                        this.deficiencyData.tags = [];
                    }
                    this.deficiencyData.tags.push({ name: data.name, _id: '' });
                    console.log(' this.deficiencyData.tags', this.deficiencyData.tags);
                    // console.log('this.formDetails.tags',this.formDetails.tags);
                    this.getTagsList(this.filterForm.project_id);
                    this.searchQuery = '';

                } else {
                    this.spinnerService.hide();
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
    }

    filterTags(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        this.searchQuery = query;
        this.tagListSuggestions = [];
        // console.log('query',query);
        if (this.searchQuery && this.tagList.length > 0) {
            let filterTags = this.tagList;
            if (filterTags.length > 0) {
                // console.log('filterTags',filterTags);
                for (let i = 0; i < filterTags.length; i++) {
                    let tag = filterTags[i];
                    if (tag.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) == 0) {
                        filtered.push(tag);
                    }
                }
            }
            else {
                for (let i = 0; i < this.tagList.length; i++) {
                    let tag = this.tagList[i];
                    if (tag.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) == 0) {
                        filtered.push(tag);
                    }
                }
            }

            this.tagListSuggestions = filtered;
            // console.log('formDetails.tags',this.formDetails.tags);
        }
    }

    getTagsList(project) {
        this.spinnerService.show();
        let url = `service/project-settings?type=PROJECT-ISSUE-TAG`;
        if (project) {
            url = url + `&project_id=${project}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.tagList = [];
                this.tagList = response.results ? response.results : [];

            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getTypeOfDeficiencyList(project) {
        this.spinnerService.show();
        let url = `service/project-settings?type=PROJECT-DEFICIENCY-TYPES`;
        if (project) {
            url = url + `&project_id=${project}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.typeOfDeficiencyList = [];
                this.typeOfDeficiencyList = response.results ? response.results : [];
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    
    ///UPLOAD IMAGE FOR DEFICIENCY /////
    async uploadAttachment(files, d_id) {
        if (files.length > 0) {
            this.spinnerService.show();
            for (let i = 0; i < files.length; i++) {
                let photo = files[i];
                let formData = new FormData();
                // formData.append('image', photo);
                const stripItem = this.dataURIToBlob(photo.url)
                formData.append('image', stripItem, 'image-' + i + '.jpg');        
                formData.append('update_type', 'attachments');
                formData.append('_id', d_id);
                let response: any = await this.asyncImageUploading(formData);
                // let response: any = {};
                if (i == (files.length - 1)) {
                    this.spinnerService.hide();
                    this.deficiencyModalRef.hide();
                    this.attachments = [];
                    // this.getDeficiencies();
                }
            }

        }
    }

    dataURIToBlob(dataURI: string) {
        const splitDataURI = dataURI.split(',')
        const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
        const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
        const ia = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++)
          ia[i] = byteString.charCodeAt(i)
        return new Blob([ia], { type: mimeString })
      }
      
    asyncImageUploading(formData) {
        let url = `service/deficiencies`;
        return new Promise(resolve => {
            this.webService.fileUpload(url, formData).subscribe((response: any) => {
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        resolve(response);
                    }
                    else {
                        this.toastr.error(response.message, 'Error');
                    }
                }

            }, (error) => {
                this.spinnerService.hide();
                console.log("error ts: ", error);
            })
        });
    }

    //FILE UPLOAD VALIDATION
    validatePhoto(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png", "pdf", "doc", "docx");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    getInspectionTypeList(project?) {
        let url = `service/project-settings?type=PROJECT-INSPECTION-TYPES`;
        if (project) {
            url = url + `&project_id=${project}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.inceptionTypeList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getPriorityList() {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-PRIORITY`;
        let url = `service/project-settings?type=PROJECT-ISSUE-PRIORITY&page=1&pageSize=200&sortBy=name&sortOrder=ASC`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.priorityList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    dropped(files: NgxFileDropEntry[],template: TemplateRef<any>) {
        for (const droppedFile of files) {

            // Is it a file?
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {

                    // Here you can access the real file
                    let validation = this.validatePhoto(file.name);
                    if (validation) {
                        // this.attachments.push(file);
                        this.getBase64(file, template);
                    }
                    else {
                        this.toastr.error("Please upload only JPG, PNG, JPEG, PDF, DOC, DOCX format", 'Error');
                    }

                });
            } else {
                // It was a directory (empty directories are added, otherwise only files)
                // const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
                console.error('It was a directory (empty directories are added, otherwise only files)');
            }
        }

    }

    //edit and draw images
    async editImage(i, item, template: TemplateRef<any>) {
        this.currentImageIndex = i;
        this.isEditImage = true;
        var isDataURLRegex = /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        if (!item.url.match(isDataURLRegex)) {
        // this.currentImageId = item._id;
        let url = await this.getBase64FromUrl(item.url);
        this.openImageEditorModal(url, true, template);
        } else {
        // this.currentImageId = '';
        this.openImageEditorModal(item.url, true, template);
        }
    }

    getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          }
        });
      }

      openImageEditorModal(imgPath, isEdit, template) {
        this.imageCanvasRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });

        setTimeout(() => {
        this.drawImage(imgPath, isEdit, template);
        }, 1000)
    }

    async drawImage(imagePath, isEdit, template) {
        var canvasElement: any = {};
        canvasElement.node = document.createElement('canvas');
        canvasElement.node.id = "drawing";
        canvasElement.context = canvasElement.node.getContext('2d');
        canvasElement.node.width = 900;//clientWidth > 900 ? 900 : clientWidth; 
        let cnvsHeight: any = await this.calculateCanvasHeight(imagePath);
        canvasElement.node.height = cnvsHeight;
        document.getElementById('canvas-area').appendChild(canvasElement.node);
        this.canvas = new fabric.Canvas(
          'drawing',
          { isDrawingMode: true }
        );
        this.canvas.freeDrawingBrush.color = 'blue';
        this.canvas.freeDrawingBrush.width = 4;
    
        var baseImage = new Image();
        baseImage.src = imagePath;
        baseImage.onload = () => {
          var canvasAspect = this.canvas.width / this.canvas.height;
    
          var imgAspect = baseImage.naturalWidth / baseImage.naturalHeight;
    
          var xyz = baseImage.naturalWidth / this.canvas.width;
          canvasElement.height = baseImage.naturalHeight / xyz;
          var left, top, scaleFactor;
          if (canvasAspect >= imgAspect) {
            scaleFactor = this.canvas.width / baseImage.naturalWidth;
            left = 0;
            top = -((baseImage.naturalHeight * scaleFactor) - this.canvas.height) / 2;
          } else {
            scaleFactor = this.canvas.height / baseImage.naturalHeight;
            top = 0;
            left = -((baseImage.naturalWidth * scaleFactor) - this.canvas.width) / 2;
          }
    
          this.canvas.setBackgroundImage(imagePath, this.canvas.renderAll.bind(this.canvas), {
            top: top,
            left: left,
            originX: 'left',
            originY: 'top',
            scaleX: scaleFactor,
            scaleY: scaleFactor
          });
        }
    }

    calculateCanvasHeight(imagePath) {
        return new Promise((resolve: any) => {
          var baseImage = new Image();
          baseImage.src = imagePath;
          baseImage.onload = () => {
            // var calcRatio = baseImage.naturalWidth > 900 ? (baseImage.naturalWidth / 900) : 900;
            var calcRatio = baseImage.naturalWidth / 900;
            resolve(baseImage.naturalHeight / calcRatio);
          }
        })
    }
    
    setImageToCanvas() {
        var baseImage = new Image();
        //baseImage.src = this.imagePath;
        baseImage.src = 'https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/900';
        baseImage.onload = () => {
          this.context.drawImage(baseImage, 0, 0);
        }
    }
    
    removeImage(e, i, item) {
        e.stopPropagation();
        var isDataURLRegex = /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        if (item.url.match(isDataURLRegex)) {
          this.attachments.splice(i, 1);
          // this.uploadedImages.splice(i, 1);
          this.toastr.success('Photo deleted successfully', 'Success!');
        } else {
          // this.deleteImage(item, false)
        }
    }
    
    saveCanvas() {
        var canvas = <HTMLCanvasElement>document.getElementById("drawing");
        var imgUrl = canvas.toDataURL("image/png");
        if (!this.isEditImage) {
          this.attachments.push({ url: imgUrl });
        } else {
          this.attachments[this.currentImageIndex] = {};
          this.attachments[this.currentImageIndex].url = imgUrl;
          // if (this.currentImageId) {
          //   let obj = {
          //     _id: this.currentImageId
          //   }
          //   this.deleteImage(obj, true)
          // }
        }
        this.imageCanvasRef.hide();
    }

     //// OPEN SLIDER RIGHT ////
     openInspectionDetails(inspection) {
        this.inspectionDetails = [];
        this.inspectionData = Object.assign({}, inspection);
        this.getChecklistItem(inspection);
    }

    toggleInspectionSlider(event) {
        if (event)
        event.stopPropagation();
        var isOpen = this.inspectionSlider.nativeElement.classList.contains('slide-in');
        this.inspectionSlider.nativeElement.setAttribute('class', isOpen ? 'slide-out div_bx_hidd' : 'slide-in div_bx_hidd');
    }

    getChecklistItem(inspection,template?) {
        this.spinnerService.show();
        this.inspectionDetails = [];
        let url = `service/inspection-items?inspection_id=${inspection._id}`;
        this.webService.get(url).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.is_valid_session) {
            if (response.status == 1) {
              let results = response.results ? response.results : [];
              let categories = results.map((element) => element.category_name);
              categories = results.map(ele => ele.category_name).filter((ele, i, arr) => arr.indexOf(ele) == i);
              categories.forEach(element => {
                if (element) {
                  let object: any = {};
                  object.category = element;
                  object.inspections = results.filter((inspection) => inspection.category_name == element);
                  this.inspectionDetails.push(object);
                }
              });
              console.log('results',results);
            //   let updatedItems =results.filter(element => (element.status == 'PASSED' || element.status == 'FAILED'));
            //     updatedItems.forEach(updatedElement => {
            //     if (template && (this.selectedItem._id == updatedElement._id) && (this.selectedItem.template_id == updatedElement.template_id)) {
            //     // console.log('inspection',inspection)
            //         // console.log('updatedItems',updatedItems,this.selectedItem)
            //         // this.openAddDeficiencyModal(this.selectedItem, template, updatedElement);
            //         this.deficiencyData = {
            //             project_id: inspection.project_id,
            //             project_name: inspection.project_name,
            //             unit_no: inspection.unit_no,
            //             location: this.selectedItem.location,
            //             title: this.selectedItem.title,
            //             unit_id: inspection.unit_id,
            //             inspection_item_id: updatedElement ? updatedElement._id : '',
            //             description: updatedElement.notes ? updatedElement.notes : '',
            //             inspection_type: this.selectedItem.inspection_type || '',
            //             priority: this.selectedItem.priority || '',
            //             due_date: this.selectedItem.due_date || '',
            //             tags: [],
            //             deficiency_type: '',
            //             charge_back: '',
            //             assignee_id:'',
            //             approver_id:''        
            //         };
            //         this.currentImageIndex = undefined;
            //         this.isEditImage = false;
            //         this.attachments = [];
            //         this.getUnitList(this.inspectionData.project_id);
            //         this.getPriorityList();
            //         this.getLocationList();
            //         this.getTypeOfDeficiencyList(this.inspectionData.project_id);
            //         this.getTagsList(this.filterForm.project_id);
            //         this.getApproverList(this.inspectionData.project_id);
            //         this.getAssigneeTrade(this.inspectionData.project_id);
            //         this.deficiencyModalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
            //         }
                
            // });
            }
          } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
          }
        }, (error) => {
          this.spinnerService.hide();
          console.log('error', error);
        });
      }

      storeInspectionType() {
        if (this.deficiencyData.inspection_type) {
          localStorage.setItem('definspectionType', this.deficiencyData.inspection_type);
        }
        else {
          localStorage.setItem('definspectionType', '');
        }
      }
    
    
      storePriority() {
        if (this.deficiencyData.priority) {
          localStorage.setItem('defPriority', this.deficiencyData.priority);
        }
        else {
          localStorage.setItem('defPriority', '');
        }
      }
    
      storeDueDate() {
        if (this.deficiencyData.due_date) {
          localStorage.setItem('defDueDate', this.deficiencyData.due_date);
        }
        else {
          localStorage.setItem('defDueDate', '');
        }
      }

      changeToFail(event,item){
        event.stopPropagation();
        this.confirmationDialogService.confirm('Confirmation', `Do you mark this item as FAILED?`)
        .then(async (confirmed) => {
            if (confirmed) {
                this.spinnerService.show();
                console.log(item);
                let itemObject: any = {
                    _id: item._id,
                    status: 'FAILED',
                }
                let inspections: any[] = [];
                inspections.push(itemObject);
                let finalpayload = {
                    items: inspections
                }
                this.spinnerService.show();
                let url = `service/inspection-items`;
                this.webService.post(url, finalpayload).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.success) {
                        if (response.status == 1) {
                            this.getChecklistItem(this.inspectionData);
                            this.toastr.success(response.message, 'Success');
                        }
                        else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                }, (error) => {
                    console.log('error', error);
                });
    

                // item.title= item.name ? item.name :'';
                // let url= `service/checklist-templates?project_id=${this.filterForm.project_id}&location=${item.location}&_id=${item.template_id}`;        
                // let resposne = await this.webService.get(url).toPromise();
                // this.spinnerService.hide();
                // if(resposne && resposne.results.length>0){
                //     let inspection= resposne.results.find((element)=>element._id==item.template_id);
                //     if(inspection){
                //         item.potential_issues=inspection.potential_issues;
                //        this.openFailedModal(template,item);
                //    }
                //    else{
                //     this.toastr.warning('No checklist template not found', 'Warning');
                //    }
                // }
                // else{
                //     this.toastr.warning('No checklist template not found', 'Warning');
                // }
            }
        })
        .catch(()=>{})
      }

      changeToPass(event,item){
        event.stopPropagation();
        this.confirmationDialogService.confirm('Confirmation', `Do you mark this item as PASSED ?`)
        .then(async (confirmed) => {
            if (confirmed) {
                let itemObject: any = {
                    _id: item._id,
                    status: 'PASSED',
                }
                let inspections: any[] = [];
                inspections.push(itemObject);
                let finalpayload = {
                    items: inspections
                }
                this.spinnerService.show();
                let url = `service/inspection-items`;
                this.webService.post(url, finalpayload).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.success) {
                        if (response.status == 1) {
                            this.getChecklistItem(this.inspectionData);

                            this.toastr.success(response.message, 'Success');
                        }
                        else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                }, (error) => {
                    this.spinnerService.hide();
                    console.log('error', error);
                });
            }
        })
        .catch(()=>{})
      }



      
}
