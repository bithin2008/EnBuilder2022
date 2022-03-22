import { Component, OnInit, TemplateRef, Input,EventEmitter, ElementRef, ViewChild, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { Subscription, Observable } from 'rxjs';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { ExportToCsv } from "export-to-csv";
import {AutoComplete} from 'primeng/autocomplete';
import { fabric } from "fabric";

@Component({
    selector: 'app-deficiency',
    templateUrl: './deficiency.component.html',
    styleUrls: ['./deficiency.component.css'],
})
export class DeficiencyComponent implements OnInit {
    private eventsSubscription: Subscription;
    private projectSubscription: Subscription;

    @Input() events: Observable<void>;
    @Input() projectListEvent: Observable<void>;

    @ViewChild('activitySlider') activitySlider: ElementRef;
    paginationObj: any = {};
    tagText:string;
    filterForm: any = {
        searchText: '',
        date_filter: '',
        startDate: '',
        month: '',
        endDate: '',
        project_id: '',
        status: [],
        tags:[],
        priority: [],
        opened_by: [],
        assignee_name: []
    };
    formDetails: any = {};
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    isClear: boolean = false;
    unitList: any = [];
    @Input() projectList: any = [];
    minDate: any;
    minDueDate: any;
    dateDiff: any;
    flag = 0;
    baseUrl = environment.BASE_URL;
    selectedAll: boolean = false;
    modalRef: BsModalRef;
    deficiencyTypes: any[] = [];
    statusList: any[] = ['Open', 'Assigned', 'Accepted', 'Not Accepted', 'Completed', 'Closed'];
    priorityList: any[] = [];
    locationList: any[] = [];
    scheduleImpacted: any = ['Yes', ' Yes (Unknown)', 'No', ' Not Sure', ' N/A'];
    costImpacted: any[] = ['Yes', 'Yes (Unknown)', 'No', 'Not Sure', 'N/A'];
    inceptionTypeList: any[] = [];
    approverList: any[] = [];
    assigneeTradeList: any[] = [];
    attachments: any[] = [];
    ueserList: any[] = [];
    isBulkAssign: boolean = false;
    dateFilter: any[] = [
        { label: 'Due Date', key: 'due_date' },
        { label: 'Open', key: 'opened_at' },
        { label: 'Closed', key: 'closed_at' },
        { label: 'Reopen', key: 'reopened_at' },
        { label: 'Approved', key: 'approved_at' },
        { label: 'Rejected', key: 'rejected_at' },
        { label: 'Accepted', key: 'accepted_at' },
        { label: 'Assigned', key: 'assigned_at' },
        { label: 'Not accepted', key: 'not_accepted_at' }
    ];
    notesMenuState: string = 'out';
    isDisabled: boolean = false;
    dropdownSettings: any = {};
    dropdownSettings2: any = {};
    dropdownSettings3: any = {};
    tagList: any[] = [];
    typeOfDeficiencyList: any[] = [];
    tagListSuggestions: any[] = [];
    historyList: any[] = [];
    commentsList: any[] = [];
    searchQuery: string = '';
    activityDetails: any = {};
    commentMsg: any = {
        comment: ''
    };
    isEdit = false;
    exoprtBtnDisable: boolean = false;
    public exportReportColumns: any = [];
    public selectedFields: any = [];
    public csvExporter: any;
    contributionListForExport: any = [];
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();

    canvas: any;
    context: any;
    imageCanvasRef: BsModalRef;
    currentImageIndex: number;
    isEditImage: boolean = false;
    assigneeList:any=[];
    reporterList:any=[];
    tagsList:any=[];
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    ngOnInit(): void {

        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            // itemsShowLimit: 1,
            allowSearchFilter: true
        };
        this.dropdownSettings2 = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            // itemsShowLimit: 1,
            allowSearchFilter: true
        };
        this.dropdownSettings3 = {
            singleSelection: false,
            idField: 'user_id',
            textField: 'display_name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            // itemsShowLimit: 1,
            allowSearchFilter: true
        };
        this.getSavedFilterdata();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.filterForm.project_id = response._id;
                this.onProjectChange(this.filterForm.project_id);
            }
            else {
                this.filterForm.project_id = '';
                this.onProjectChange(this.filterForm.project_id);
            }
        });

        this.projectSubscription = this.projectListEvent.subscribe((response: any) => {
            if (response) {
                this.projectList = response.projects;
            }
            else {
                this.projectList = [];
            }
            this.getSavedFilterdata();
        });

        let mendDate = moment().startOf('month').format('YYYY-MM-DD');
        this.minDueDate= new Date(mendDate);
    }


    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
        if (this.projectSubscription) {
            this.projectSubscription.unsubscribe();
        }
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
    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('serviceProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData._id) {
                this.filterForm.project_id = projectData._id;
            }
            else {
                this.filterForm.project_id = this.projectList.length>0 ?  this.projectList[0]._id :'';
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

        let filterData: any = localStorage.getItem('deficiencyFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
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
            if (filterData.month) {
                this.filterForm.month = filterData.month;
            }
            if (filterData.date_filter) {
                this.filterForm.date_filter = filterData.date_filter;
            }
            if (filterData.startDate) {
                this.filterForm.startDate = filterData.startDate;
            }
            if (filterData.endDate) {
                this.filterForm.endDate = filterData.endDate;
            }
            if (filterData.month) {
                this.filterForm.month = filterData.month;
            }
            if (filterData.status) {
                this.filterForm.status = filterData.status;
            }
            if (filterData.priority) {
                this.filterForm.priority = filterData.priority;
            }
            if (filterData.opened_by) {
                this.filterForm.opened_by = filterData.opened_by;
            }
            if (filterData.assignee_name) {
                this.filterForm.assignee_name = filterData.assignee_name;
            }

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getInspectionTypeList();
        this.getPriorityList(this.filterForm.project_id);
        this.getUsers();
        this.getAllTagsList(this.filterForm.project_id);
        this.filterByDateControle();
    
    }

    toggleNotesMenu() {
        this.notesMenuState = this.notesMenuState === 'out' ? 'in' : 'out';
    }
    openActivityDetails(activity) {
        this.activityDetails = {};
        // this.activityDetails = activity;
        let url = `service/deficiencies?_id=${activity._id}`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.activityDetails = response.result? response.result :{};
                    this.getHistoryList( this.activityDetails);
                    this.getCommentsList( this.activityDetails);
                    this.commentMsg.comment = '';

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
    toggleActivitySlider(event?) {
        if (event)
            event.stopPropagation();
        var isOpen = this.activitySlider.nativeElement.classList.contains('slide-in');
        this.activitySlider.nativeElement.setAttribute('class', isOpen ? 'slide-out div_bx_hidd' : 'slide-in div_bx_hidd');
    }

    deleteDeficiency(){
        // console.log('activityDetails',this.activityDetails);
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this deficiency ?`)
        .then((confirmed) => {
            if (confirmed) {
                let url = `service/deficiencies?_id=${this.activityDetails._id}`;
                this.spinnerService.show();
                this.webService.delete(url).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.toggleActivitySlider();
                            this.getDeficiencies();
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
        })
        .catch((error) => { });
    }

    ngDoCheck() {
        if (this.notesMenuState == 'out') {
            if (this.flag == 0) {
                this.flag = this.flag + 1;
                //   this.getNotes();
            }
        } else {
            this.flag = 0;
        }

        this.minDate = new Date(this.filterForm.startDate);
        let dateDiff = moment(this.filterForm.startDate).diff(moment(this.filterForm.endDate));
        if (dateDiff == NaN || dateDiff > 0) {
            this.filterForm.endDate = '';
        }
        if (!this.filterForm.endDate) {
            this.filterForm.endDate = '';
        }

        if (this.filterForm.startDate) {
            this.filterForm.startDate = moment(this.filterForm.startDate).format('YYYY-MM-DD');
        }
        if (this.filterForm.endDate) {
            this.filterForm.endDate = moment(this.filterForm.endDate).format('YYYY-MM-DD');
        }
    }

    getUnitList(project_id) {
        if (!project_id) {
            this.toastr.warning('Please select project!', 'Warning');
            return false;
        }
        this.spinnerService.show();
        let url = `service/units?project_id=${project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitList = response.results ? response.results : [];
                    this.formDetails.unit_no = '';
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    filterByDateControle() {
        this.page = 1;
        this.changeDateControle();
    }

    changeDateControle() {
        // console.log('month', this.filterForm.month);
        if (this.filterForm.month == 'custom') {
            this.isDisabled = false;
            return;
        }
        if (this.filterForm.month != 'custom') {

            if (this.filterForm.month == 'currentMonth') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('month').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('month').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'nextMonth') {
                this.isDisabled = true;
                let nextMonth = moment().add(1, 'month');
                this.filterForm.startDate = moment(nextMonth).startOf('month').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(nextMonth).endOf('month').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'today') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('day').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('day').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'yesterday') {
                this.isDisabled = true;
                let lastDay = moment().subtract(1, 'day');
                this.filterForm.startDate = moment(lastDay).startOf('day').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastDay).endOf('day').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'currentWeek') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('week').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('week').format('YYYY-MM-DD');

            }
            else if (this.filterForm.month == 'nextWeek') {
                this.isDisabled = true;
                let nextWeek = moment().add(1, 'week');
                this.filterForm.startDate = moment(nextWeek).startOf('week').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(nextWeek).endOf('week').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'lastWeek') {
                this.isDisabled = true;
                let lastWeek = moment().subtract(1, 'week');
                this.filterForm.startDate = moment(lastWeek).startOf('week').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastWeek).endOf('week').format('YYYY-MM-DD');

            }
            else if (this.filterForm.month == 'lastMonth') {
                this.isDisabled = true;
                let lastMonth = moment().subtract(1, 'months');
                this.filterForm.startDate = moment(lastMonth).startOf('month').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastMonth).endOf('month').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'currentYear') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('year').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('year').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'lastYear') {
                this.isDisabled = true;
                let lastYear = moment().subtract(1, 'years');;
                this.filterForm.startDate = moment(lastYear).startOf('year').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastYear).endOf('year').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == '') {
                this.isDisabled = true;
                this.filterForm.startDate = '';
                this.filterForm.endDate = '';
            } else {
                this.isDisabled = false;
                if (this.filterForm.startDate != '') {
                    this.filterForm.startDate = moment(this.filterForm.startDate).format('YYYY-MM-DD');
                    this.minDate = new Date(this.filterForm.startDate);
                }
                if (this.filterForm.endDate != '')
                    this.filterForm.endDate = moment(this.filterForm.endDate).format('YYYY-MM-DD');
            }
            this.getDeficiencies();
        }

    }

    getDeficiencies() {
        // if (!this.filterForm.project_id) {
        //     this.toastr.warning('Please select project!', 'Warning');
        //     return false;
        // }
        this.saveFilter();
        this.spinnerService.show();
        let url = `service/deficiencies?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.date_filter) {
            url = url + `&date_type=${this.filterForm.date_filter}`;
        }
        if (this.filterForm.month && this.filterForm.startDate) {
            // url = url + `&date_type=${this.filterForm.date_filter}`;
            url = this.filterForm.endDate ? url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}` : url + `&start_date=${this.filterForm.startDate}`;
        }
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        if (this.filterForm.priority.length > 0) {
            const values = this.filterForm.priority.map((ele) => ele.name);
            const valueString = values.join();
            url = url + `&priority=${valueString}`;
        }
        if (this.filterForm.status.length > 0) {
            const values = this.filterForm.status.map((ele) => ele);
            const valueString = values.join();
            url = url + `&status=${valueString}`;
        }
        if (this.filterForm.tags.length > 0) {
            const values = this.filterForm.tags.map((ele) => ele.name);
            const valueString = values.join();
            url = url + `&tags=${valueString}`;
        }
        if (this.filterForm.opened_by.length > 0) {
            const values = this.filterForm.opened_by.map((ele) => ele.user_id);
            const valueString = values.join();
            url = url + `&opened_by=${valueString}`;
        }
        if (this.filterForm.assignee_name.length > 0) {
            const values = this.filterForm.assignee_name.map((ele) => ele.user_id);
            const valueString = values.join();
            url = url + `&assignee=${valueString}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.selectedAll = false;
                    this.deficiencyTypes = response.results ? response.results : [];
                    this.deficiencyTypes.forEach(element => {
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

    onApply() {
        this.page = 1;
        this.getDeficiencies();
    }
    onDateFlterChange() {
        this.page = 1;
        if (!this.filterForm.date_filter) {
            this.filterForm.startDate = '';
            this.filterForm.endDate = '';
        }
        this.changeDateControle();

    }

    doPaginationWise(page) {
        this.page = page;
        this.getDeficiencies();
    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getDeficiencies();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';

        this.getDeficiencies();
    }
    setPageSize() {
        this.page = 1;
        this.getDeficiencies();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            date_filter: '',
            startDate: '',
            endDate: '',
            month: '',
            status: [],
            priority: [],
            opened_by: [],
            assignee_name: [],
            tags:[]
        };
        this.isClear = false;
        this.getDeficiencies();
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            date_filter: this.filterForm.date_filter,
            startDate: this.filterForm.startDate,
            endDate: this.filterForm.endDate,
            month: this.filterForm.month,
            status: this.filterForm.status,
            priority: this.filterForm.priority,
            opened_by: this.filterForm.opened_by,
            assignee_name: this.filterForm.assignee_name
        }
        localStorage.setItem('deficiencyFilterData', JSON.stringify(data));
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
        this.getDeficiencies();
    }
    onItemSelect() {
        this.page = 1;
        this.getDeficiencies();
    }

    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getDeficiencies();
    }
    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getDeficiencies();
    }
    // getProjectList() {
    //     this.spinnerService.show();
    //     let url = `service/projects`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.status == 1) {
    //             this.projectList = response.results;

    //             // this.getSavedFilterdata();
    //             // this.getPriorityList(this.filterForm.project_id);
    //             // this.getUsers();
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }

    onProjectChange(project) {
        this.formDetails.assignee_id = '';
        this.formDetails.approver_id = '';
        this.formDetails.unit_no = '';
        this.filterByDateControle();
        this.getPriorityList(this.filterForm.project_id);
        this.getUsers();
        this.getInspectionTypeList();
    }

    openAssignModal(template: TemplateRef<any>) {
        this.formDetails = {};
        this.formDetails.tags = [];
        this.getApproverList(this.filterForm.project_id);
        this.getAssigneeTrade(this.filterForm.project_id);
        this.getPriorityList(this.filterForm.project_id);
        this.getTagsList(this.filterForm.project_id);
        this.getTypeOfDeficiencyList(this.filterForm.project_id);
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    openAddDeficiencyModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            project_id: this.filterForm.project_id,
            unit_id: '',
            // tag: [],
            deficiency_type: '',
            charge_back: '',
            assignee_id:'',
            approver_id:'',     
        };
        this.formDetails.inspection_type = localStorage.getItem('definspectionType') ? localStorage.getItem('definspectionType') : '';
        this.formDetails.due_date = localStorage.getItem('defDueDate') ? moment(localStorage.getItem('defDueDate')).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD');    

        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.attachments = [];
        this.currentImageIndex = undefined;
        this.isEditImage = false;
        this.getApproverList(this.filterForm.project_id);
        this.getAssigneeTrade(this.filterForm.project_id);
        // this.getUnitList(this.filterForm.project_id);
        this.getLocationList(this.filterForm.project_id);
        this.getPriorityList(this.filterForm.project_id);
        this.getTagsList(this.filterForm.project_id);
        this.getTypeOfDeficiencyList(this.filterForm.project_id);
        this.getInspectionTypeList(this.filterForm.project_id);

        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    getUnits(event) {
        // console.log('event', event)
        let url = `service/units?project_id=${this.formDetails.project_id}&searchText=${event.query ? event.query : this.formDetails.unit.unit_no}`;
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

    openEditDeficiencyModal(template: TemplateRef<any>, item) {
        this.isEdit = true;
        this.getApproverList(item.project_id);
        this.getAssigneeTrade(item.project_id);
        this.getLocationList(item.project_id);
        this.getPriorityList(item.project_id);
        this.getTagsList(item.project_id);
        this.getInspectionTypeList(item.project_id);
        this.getTypeOfDeficiencyList(item.project_id);
        this.formDetails = {
            assignee_id: item.assignee_id || '',
            assignee_name: item.assignee_name || '',
            charge_back: item.charge_back || '',
            cost_codes: item.cost_codes || '',
            cost_impacted: item.cost_impacted || '',
            deficiency_type: item.deficiency_type || '',
            description: item.description || '',
            due_date: item.due_date || '',
            inspection_type: item.inspection_type || '',
            is_private: item.is_private || false,
            location: item.location || '',
            priority: item.priority || '',
            project_id: item.project_id || '',
            project_name: item.project_name || '',
            schedule_impacted: item.schedule_impacted || '',
            title: item.title || '',
            _id: item._id || '',
            approver_id:item.approver_id || '', 

        }
        this.formDetails.unit={
            _id: item.unit_id || '',
            unit_no: item.unit_no || '',
        }
        this.formDetails.unit_id= item.unit_id || '';
        if( this.formDetails.cost_impacted =='Yes'){
            this.formDetails['cost']=item.cost || '';
        }
        this.formDetails.tags = [];
        if (item.tags) {
            item.tags.forEach(element => {
                this.formDetails.tags.push({ name: element, _id: '' });
            });
        }
        if(item.attachments && item.attachments.length>0 ){
            this.formDetails.attachments=item.attachments;
        }
        this.currentImageIndex = undefined;
        this.isEditImage = false;
        // console.log(this.formDetails);
        this.formDetails.due_date = item.due_date ? moment(item.due_date).format('YYYY-MM-DD') :  moment(new Date()).format('YYYY-MM-DD');
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    getUsers() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `service/users?project_id=${this.filterForm.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.ueserList = response.results ? response.results : [];
                    this.reporterList= this.ueserList.filter((ele)=>ele.roles.includes('INSPECTOR'));
                    this.assigneeList= this.ueserList.filter((ele)=>ele.roles.includes('TRADE'))
                } else {
                    this.ueserList = [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    selectAll() {
        for (var i = 0; i < this.deficiencyTypes.length; i++) {
            this.deficiencyTypes[i].selected = this.selectedAll;
        }
        this.onChangeDeleteCheckbox();
    }
    onChangeDeleteCheckbox() {
        let records = this.deficiencyTypes.filter(element => element.selected == true);
        if (records.length > 0) {
            this.isBulkAssign = true;
        }
        else {
            this.isBulkAssign = false;
            this.selectedAll = false;
        }
    }

    updateAssignInformation() {
        let selectedItems = this.deficiencyTypes.filter((item) => item.selected);
        if (selectedItems && selectedItems.length == 0) {
            this.toastr.warning('Please select deficiency', 'Warning');
            return false;
        }
        if (this.formDetails.is_status && !this.formDetails.status) {
            this.toastr.warning('Please select deficiency type', 'Warning');
            return false;
        }
        if (this.formDetails.is_due_date && !this.formDetails.due_date) {
            this.toastr.warning('Please select due date', 'Warning');
            return false;
        }
        if (this.formDetails.is_priority && !this.formDetails.priority) {
            this.toastr.warning('Please select priority ', 'Warning');
            return false;
        }
        if (this.formDetails.is_tag && this.formDetails.tags.length == 0) {
            this.toastr.warning('Please select tag ', 'Warning');
            return false;
        }

        if (this.formDetails.is_deficiency_type && !this.formDetails.deficiency_type) {
            this.toastr.warning('Please select deficiency type ', 'Warning');
            return false;
        }
        if (this.formDetails.is_approver && !this.formDetails.approver_id) {
            this.toastr.warning('Please select approver', 'Warning');
            return false;
        }
        if (this.formDetails.is_assignee && !this.formDetails.assignee_id) {
            this.toastr.warning('Please select assignee', 'Warning');
            return false;
        }
        if (this.formDetails.is_schedule_impacted && !this.formDetails.schedule_impacted) {
            this.toastr.warning('Please select schedule impacted', 'Warning');
            return false;
        }
        if (this.formDetails.is_cost_impacted && !this.formDetails.cost_impacted) {
            this.toastr.warning('Please select cost impacted', 'Warning');
            return false;
        }

        if (this.formDetails.is_cost_codes && !this.formDetails.cost_codes) {
            this.toastr.warning('Please select cost codes', 'Warning');
            return false;
        }
        let url = `service/deficiencies-assign`;
        let data: any = {
            data_to_update: {}
        };
        if (this.formDetails.is_status && this.formDetails.status) {
            data.data_to_update.status = this.formDetails.status;
        }
        if (this.formDetails.is_due_date && this.formDetails.due_date) {
            data.data_to_update.due_date = moment(this.formDetails.due_date).format('YYYY-MM-DD');
        }
        if (this.formDetails.is_priority && this.formDetails.priority) {
            data.data_to_update.priority = this.formDetails.priority;
        }
        if (this.formDetails.is_tag && this.formDetails.tags) {
            let tags = [];
            this.formDetails.tags.forEach(element => {
                tags.push(element.name);
            });
            data.data_to_update.tags = tags;
        }
        if (this.formDetails.is_deficiency_type && this.formDetails.deficiency_type) {
            data.data_to_update.deficiency_type = this.formDetails.deficiency_type;
        }
        if (this.formDetails.is_approver && this.formDetails.approver_id) {
            let selectedApprover = this.approverList.find((record) => record.user_id == this.formDetails.approver_id);
            data.data_to_update.approver_name = selectedApprover.display_name;
            data.data_to_update.approver_id = this.formDetails.approver_id;
        }
        if (this.formDetails.is_assignee && this.formDetails.assignee_id) {
            let selectedAssignee = this.assigneeTradeList.find((record) => record.user_id == this.formDetails.assignee_id);
            data.data_to_update.assignee_name = selectedAssignee.display_name;
            data.data_to_update.assignee_id = this.formDetails.assignee_id;
        }
        if (this.formDetails.is_schedule_impacted && this.formDetails.schedule_impacted) {
            data.data_to_update.schedule_impacted = this.formDetails.schedule_impacted;
        }
        if (this.formDetails.is_cost_impacted && this.formDetails.cost_impacted) {
            data.data_to_update.cost_impacted = this.formDetails.cost_impacted;
            data.data_to_update.cost = this.formDetails.cost ? this.formDetails.cost : '';
        }
        if (this.formDetails.is_cost_codes && this.formDetails.cost_codes) {
            data.data_to_update.cost_codes = this.formDetails.cost_codes;
        }
        let deficiency_ids: any = selectedItems.length > 0 ? selectedItems.map(element => element._id) : '';

        data.deficiency_ids = deficiency_ids;

        if (Object.keys(data.data_to_update).length == 0) {
            this.toastr.warning('Please select field to update', 'Warning');
            return false;
        }

        //For History
        let fields = ['status', 'priority', 'due_date', 'deficiency_type', 'schedule_impacted', 'assignee_name', 'approver_name', 'cost_codes', 'cost_impacted']
        let historyData = [];
        selectedItems.forEach(item => {
            let object: any = {
                history: [],
                type: "deficiency",
                id: `${item._id}`

            };
            fields.forEach(element => {
                if (data.data_to_update[element]) {
                    if (element != 'tags') {
                        if (data.data_to_update[element] != item[element]) {
                            let payload = {
                                attribute_name: element,
                                change_type: "edited",
                                new_value: `${data.data_to_update[element]}`,
                                old_value: `${item[element] ? item[element] : ''}`
                            }
                            object.history.push(payload);

                            if (element == 'cost_impacted') {
                                let payload = {
                                    attribute_name: 'cost',
                                    change_type: "edited",
                                    new_value: `${data['cost']}`,
                                    old_value: `${item['cost'] ? item['cost'] : ''}`

                                }
                                object.history.push(payload);
                            }
                        }
                    }
                    else {
                        if (data.data_to_update['tags'].join() != item['tags'].join()) {
                            let object: any = {};
                            let payload = {
                                attribute_name: 'tags',
                                change_type: "edited",
                                new_value: `${data.data_to_update['tags']}`,
                                old_value: `${item['tags'] ? item['tags'] : ''}`

                            }
                            object.history.push(payload);
                        }
                    }
                }
            })
            historyData.push(object);

        });
        // console.log('data', data, historyData);

        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.isBulkAssign = false;
                    this.selectedAll = false;
                    this.modalRef.hide();
                    this.getDeficiencies();
                    this.addMultipleHistory(historyData);
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

    onFormProjectChange(project) {
        // this.getUnitList(project);
        this.getApproverList(project);
        this.getAssigneeTrade(project);
        this.getLocationList(project);
        this.getPriorityList(project);
        this.getTagsList(project);
        this.getTypeOfDeficiencyList(project);
        this.formDetails.assignee_id = '';
        this.formDetails.approver_id = '';
        this.formDetails.unit={
            unit_id:'',
            unit_no:''
        }

    }

    addDeficiency() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.unit_id) {
            this.toastr.warning('Please select unit', 'Warning');
            return;
        }
        if (!this.formDetails.title || !this.formDetails.title.trim()) {
            this.toastr.warning('Please enter title', 'Warning');
            return;
        }
        if (!this.formDetails.inspection_type) {
            this.toastr.warning('Please select inspection type', 'Warning');
            return;
        }
        // if (!this.formDetails.location) {
        //     this.toastr.warning('Please select location', 'Warning');
        //     return;
        // }
        if (!this.formDetails.priority) {
            this.toastr.warning('Please select priority', 'Warning');
            return;
        }
        if (!this.formDetails.due_date) {
            this.toastr.warning('Please select due date', 'Warning');
            return;
        }
        // if (!this.formDetails.tags || this.formDetails.tags.length == 0) {
        //     this.toastr.warning('Please select tags', 'Warning');
        //     return;
        // }
        if (!this.formDetails.deficiency_type) {
            this.toastr.warning('Please select deficiency type', 'Warning');
            return;
        }
        let data: any = Object.assign({},this.formDetails);
        if (this.formDetails.assignee_id) {
            let selectedAssignee = this.assigneeTradeList.find((record) => record.user_id == this.formDetails.assignee_id);
            data.assignee_name = selectedAssignee.display_name;
        }
        else {
            delete data.assignee_id;
        }
        if (this.formDetails.approver_id) {
            let selectedApprover = this.approverList.find((record) => record.user_id == this.formDetails.approver_id);
            data.approver_name = selectedApprover.display_name;
        }
        else {
            delete data.approver_id;
        }
        let tags = [];
            if (this.formDetails.tags && this.formDetails.tags.length > 0) {
                this.formDetails.tags.forEach(element => {
                    tags.push(element.name);
                });
            }
        delete data.unit;
        let selectedUnit = this.unitList.find((record) => record._id == this.formDetails.unit_id);
        let selectedProject = this.projectList.find((record) => record._id == this.formDetails.project_id);
        data.unit_no = selectedUnit ? selectedUnit.unit_no : '';
        data.due_date = moment(this.formDetails.due_date).format('YYYY-MM-DD');
        data.project_name = selectedProject ? selectedProject.name : '';
        data.status = 'Open';
        data.tags = tags;
        let url = `service/deficiencies`;
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.storeInspectionType();
                    this.storePriority();
                    this.storeDueDate();    
                    if (this.attachments && this.attachments.length > 0) {
                        // console.log('attachments', this.attachments);
                        this.uploadAttachment(this.attachments, response.result._id);
                    }
                    else {
                        this.getDeficiencies();
                        this.modalRef.hide();
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

    editDeficiency() {
        // console.log(this.formDetails.unit);
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (typeof(this.formDetails.unit)=="object" && (!this.formDetails.unit._id || !this.formDetails.unit.unit_no) ) {
            this.toastr.warning('Please select unit', 'Warning');
            return;
        }
        if (!this.formDetails.title || !this.formDetails.title.trim()) {
            this.toastr.warning('Please enter title', 'Warning');
            return;
        }
        if (!this.formDetails.inspection_type) {
            this.toastr.warning('Please select inspection type', 'Warning');
            return;
        }
        // if (!this.formDetails.location) {
        //     this.toastr.warning('Please select location', 'Warning');
        //     return;
        // }
        if (!this.formDetails.priority) {
            this.toastr.warning('Please select priority', 'Warning');
            return;
        }
        if (!this.formDetails.due_date) {
            this.toastr.warning('Please select due date', 'Warning');
            return;
        }
        // if (!this.formDetails.tags || this.formDetails.tags.length == 0) {
        //     this.toastr.warning('Please select tags', 'Warning');
        //     return;
        // }
        if (!this.formDetails.deficiency_type) {
            this.toastr.warning('Please select deficiency type', 'Warning');
            return;
        }
        let data: any = Object.assign({},this.formDetails);
        if (this.formDetails.assignee_id) {
            let selectedAssignee = this.assigneeTradeList.find((record) => record.user_id == this.formDetails.assignee_id);
            data.assignee_name = selectedAssignee.display_name;
        }
        else {
            delete data.assignee_id;
        }
        if (this.formDetails.approver_id) {
            let selectedApprover = this.approverList.find((record) => record.user_id == this.formDetails.approver_id);
            data.approver_name = selectedApprover.display_name;
        }
        else {
            delete data.approver_id;
        }
        let tags = [];
        if (this.formDetails.tags && this.formDetails.tags.length > 0) {
            this.formDetails.tags.forEach(element => {
                tags.push(element.name);
            });
        }
        // let selectedUnit = this.unitList.find((record) => record._id == this.formDetails.unit_id);
        let selectedProject = this.projectList.find((record) => record._id == this.formDetails.project_id);
        data.unit_no = this.formDetails.unit.unit_no ? this.formDetails.unit.unit_no : '';
        data.due_date = moment(this.formDetails.due_date).format('YYYY-MM-DD');
        data.project_name = selectedProject ? selectedProject.name : '';
        data.tags = tags;
        data._id = this.formDetails._id;

        delete data.unit; //to remove unit payload

        if (data.attachments) {
            delete data.attachments;
        }
        // console.log(this.activityDetails, data);
        // For history
        let history = [];
        this.activityDetails.due_date = this.activityDetails['due_date'] ? moment(this.activityDetails['due_date']).format('YYYY-MM-DD') : '';
        let fields = ['project_name', 'unit_no', 'title', 'inspection_type', 'location', 'priority', 'due_date', 'deficiency_type', 'description', 'schedule_impacted', 'is_private', 'assignee_name', 'approver_name', 'charge_back', 'cost_codes', 'cost_impacted']
        fields.forEach(element => {
            if (data[element] != this.activityDetails[element]) {

                let payload = {
                    attribute_name: element,
                    change_type: "edited",
                    new_value: `${data[element]}`,
                    old_value: `${this.activityDetails[element] ? this.activityDetails[element] : ''}`
                }
                history.push(payload);
                // dependent attributes
                if (element == 'cost_impacted') {
                    let payload = {
                        attribute_name: 'cost',
                        change_type: "edited",
                        new_value: `${data['cost']}`,
                        old_value: `${this.activityDetails['cost'] ? this.activityDetails['cost'] : ''}`

                    }
                    history.push(payload);
                }
            }
        });
        if (this.activityDetails['tags'] && (data['tags'].join() != this.activityDetails['tags'].join())) {
            let payload = {
                attribute_name: 'tags',
                change_type: "edited",
                new_value: `${data['tags']}`,
                old_value: `${this.activityDetails['tags'] ? this.activityDetails['tags'] : ''}`

            }
            history.push(payload);
        }
        // console.log('history', history);
        // console.log('data', data);
        let url = `service/deficiencies`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.activityDetails = response.result;
                    // console.log('activityDetails after edit', this.activityDetails);
                    this.toastr.success(response.message, 'Success');
                    this.addHistory(history);
                    if (this.attachments && this.attachments.length > 0) {
                        // console.log('attachments', this.attachments);
                        this.uploadAttachment(this.attachments, response.result._id);
                    }
                    else {
                        this.getDeficiencies();
                        this.modalRef.hide();
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

    getLocationList(project?) {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-LOCATION`;
        let url = `service/project-settings?type=PROJECT-ISSUE-LOCATION&page=1&pageSize=200&sortBy=order&sortOrder=ASC`;
        if (project) {
            url = url + `&project_id=${project}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.locationList = response.results ? response.results : [];
                    // this.formDetails.location = this.locationList.length > 0 ? this.locationList[0].name : '';
                    this.formDetails.location = '';

                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
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

    getPriorityList(project) {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-PRIORITY`;
        let url = `service/project-settings?type=PROJECT-ISSUE-PRIORITY&page=1&pageSize=200&sortBy=name&sortOrder=ASC`;
        if (project) {
            url = url + `&project_id=${project}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.priorityList = response.results ? response.results : [];
                    if (!this.formDetails.priority) {
                        // this.formDetails.priority = this.priorityList.length > 0 ? this.priorityList[0].name : '';
                        this.formDetails.priority = localStorage.getItem('defPriority') ? localStorage.getItem('defPriority') : '';    
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

    getAllTagsList(project){
        this.spinnerService.show();
        let url = `service/project-settings?type=PROJECT-ISSUE-TAG`;
        if (project) {
            url = url + `&project_id=${project}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.tagsList = [];
                this.tagsList = response.results ? response.results : [];

            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    storeInspectionType() {
        if (this.formDetails.inspection_type) {
          localStorage.setItem('definspectionType', this.formDetails.inspection_type);
        }
        else {
          localStorage.setItem('definspectionType', '');
        }
    }
    
    
      storePriority() {
        if (this.formDetails.priority) {
          localStorage.setItem('defPriority', this.formDetails.priority);
        }
        else {
          localStorage.setItem('defPriority', '');
        }
      }
    
      storeDueDate() {
        if (this.formDetails.due_date) {
          localStorage.setItem('defDueDate', this.formDetails.due_date);
        }
        else {
          localStorage.setItem('defDueDate', '');
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

    /// DEFICINECY ATTACHMENTS//
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
    
    removeUploadedImage(){

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
                // console.log(response);
                this.activityDetails = response.result.row;
                if (i == (files.length - 1)) {
                    this.spinnerService.hide();
                    this.modalRef.hide();
                    this.attachments = [];
                    this.getDeficiencies();
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

    getAssigneeTrade(project) {
        if (!project) {
            this.toastr.warning('Please select project!', 'Warning');
            return false;
        }
        this.spinnerService.show();
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
        this.spinnerService.show();
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

    filterModel(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        this.searchQuery = query;
        this.tagListSuggestions = [];
        if (this.searchQuery && this.tagList.length > 0) {
            let filterTags = this.tagList;
            if (filterTags.length > 0) {
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

    appendNewElement(event) {
        // console.log('appendNewElement');
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
                    if (this.formDetails.tags && this.formDetails.tags.length > 0) {
                        let oldRecords = [...this.formDetails.tags];
                        this.formDetails.tags = [...oldRecords];
                    }
                    else {
                        this.formDetails.tags = [];
                    }
                    this.formDetails.tags.push({ name: data.name, _id: '' });
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

    onDropdownClick() {
        this.searchQuery = '';
    }


    getCommentsList(item) {
        this.commentsList = [];
        this.spinnerService.show();
        let url = `service/comments?id=${item._id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.commentsList = response.results.rows;
                    }
                } else {
                    this.toastr.error(response.error, 'Error');
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login']);
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getHistoryList(item) {
        this.historyList = [];
        this.spinnerService.show();
        let url = `service/change-history?type=deficiency&id=${item._id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.historyList = response.results.rows;
                    }
                } else {
                    this.toastr.error(response.error, 'Error');
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login']);
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    postComment() {
        if (!this.commentMsg.comment) {
            this.toastr.warning('Please enter message', 'Warning');
            return;
        }
        else {
            this.spinnerService.show();
            let data: any = {
                message: this.commentMsg.comment,
                id: this.activityDetails._id
            };

            let url = `service/comments`;
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.success) {
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.commentMsg = {
                                comment: ''
                            };
                            this.getCommentsList(this.activityDetails);
                        }
                    } else {
                        this.toastr.error(response.error, 'Error');
                    }
                } else {
                    this.spinnerService.hide();
                    this.toastr.error(response.message, 'Error');
                    this.router.navigate(['/login']);
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
    }

    deletePhoto(item, i) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this attachment ?`)
            .then((confirmed) => {
                if (confirmed) {
        if (this.formDetails.attachments) {
            let url = `service/deficiency-image?deficiency_id=${this.activityDetails._id}&photo_id=${item._id}`;
            this.webService.delete(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.formDetails.attachments.splice(i, 1);
                        this.toastr.success(response.message, 'Success');
                        this.getDeficiencies();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        }
        })
        .catch((error) => { });
    }

    openAssignStatusModal(template: TemplateRef<any>) {
        this.formDetails = {
            assignee_id: this.activityDetails.assignee_id ? this.activityDetails.assignee_id : '',
            assignee_name: this.activityDetails.assignee_name ? this.activityDetails.assignee_name : ''

        };
        this.getAssigneeTrade(this.filterForm.project_id);
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    openCompleteStatusModal(template: TemplateRef<any>) {
        this.formDetails = {
            comment: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    openCloseStatusModal(template: TemplateRef<any>) {
        this.formDetails = {
            comment: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    openRejectStatusModal(template: TemplateRef<any>) {
        this.formDetails = {
            comment: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    onAssign() {
        let data: any = {};
        if (!this.formDetails.assignee_id) {
            this.toastr.warning('Please select assignee', 'Warning');
            return;
        }
        let selectedAssignee = this.assigneeTradeList.find((record) => record.user_id == this.formDetails.assignee_id);
        data.assignee_name = selectedAssignee.display_name;
        data.assignee_id = this.formDetails.assignee_id;
        data._id = this.activityDetails._id;
        if (this.activityDetails.status == 'Open') {
            data.status = 'Assigned';
        }

        //For history
        let history = [];
        let assignee_id_payload = {
            attribute_name: "assignee_id",
            change_type: "edited",
            new_value: `${data.assignee_id}`,
            old_value: `${this.activityDetails.assignee_id ? this.activityDetails.assignee_id : ''}`
        }
        history.push(assignee_id_payload);
        let assignee_name_payload = {
            attribute_name: "assignee_name",
            change_type: "edited",
            new_value: `${data.assignee_name}`,
            old_value: `${this.activityDetails.assignee_name ? this.activityDetails.assignee_name : ''}`
        }
        history.push(assignee_name_payload);
        if (this.activityDetails.status == 'Open') {
            let status_payload = {
                attribute_name: "status",
                change_type: "edited",
                new_value: `${data.status}`,
                old_value: `${this.activityDetails.status ? this.activityDetails.status : ''}`
            }
            history.push(status_payload);
        }
        // console.log('data==>', data);
        let url = `service/deficiencies`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.activityDetails = response.result ? response.result : {};
                    this.toastr.success(response.message, 'Success');
                    this.getDeficiencies();
                    this.addHistory(history);
                    this.modalRef.hide();
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

    onComplete() {
        let data: any = {};
        data.status = 'Completed';
        data._id = this.activityDetails._id;
        //For history
        let history = [];
        let status_payload = {
            attribute_name: "status",
            change_type: "edited",
            new_value: `${data.status}`,
            old_value: `${this.activityDetails.status ? this.activityDetails.status : ''}`
        }
        history.push(status_payload);

        // console.log('data==>', data);
        let url = `service/deficiencies`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.activityDetails = response.result;
                    this.addHistory(history);
                    if (this.formDetails.comment) {
                        this.addComment(this.formDetails.comment);
                    }
                    else {
                        this.getDeficiencies();
                        this.modalRef.hide();
                    }
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

    onClose() {
        let data: any = {};
        data.status = 'Closed';
        data._id = this.activityDetails._id;
        //For history
        let history = [];
        let status_payload = {
            attribute_name: "status",
            change_type: "edited",
            new_value: `${data.status}`,
            old_value: `${this.activityDetails.status ? this.activityDetails.status : ''}`
        }
        history.push(status_payload);

        let url = `service/deficiencies`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.activityDetails = response.result;
                    this.addHistory(history);
                    if (this.formDetails.comment) {
                        this.addComment(this.formDetails.comment);
                    }
                    else {
                        this.getDeficiencies();
                        this.modalRef.hide();
                    }
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

    onReject() {
        let data: any = {};
        data.status = 'Assigned';
        data._id = this.activityDetails._id;
        data.rejected = true;
        //For history
        let history = [];
        let status_payload = {
            attribute_name: "status",
            change_type: "edited",
            new_value: `${data.status}`,
            old_value: `${this.activityDetails.status ? this.activityDetails.status : ''}`
        }
        history.push(status_payload);

        let url = `service/deficiencies`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.activityDetails = response.result;
                    this.addHistory(history);
                    if (this.formDetails.comment) {
                        this.addComment(this.formDetails.comment);
                    }
                    else {
                        this.getDeficiencies();
                        this.modalRef.hide();
                    }
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

    addComment(comment) {
        this.spinnerService.show();
        let data: any = {
            message: comment,
            id: this.activityDetails._id
        };

        let url = `service/comments`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getCommentsList(this.activityDetails);
                        this.getDeficiencies();
                        this.modalRef.hide();
                    }
                } else {
                    this.toastr.error(response.error, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login']);
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    addHistory(history) {
        if (history.length > 0) {
            this.spinnerService.show();
            let url = `service/change-history`;
            let data: any = {};
            data.type = "deficiency";
            data.id = `${this.activityDetails._id}`;
            data.history = history;
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.success) {
                        if (response.status == 1) {
                            this.getHistoryList(this.activityDetails);
                        }
                    } else {
                        this.toastr.error(response.error, 'Error');
                    }
                } else {
                    this.spinnerService.hide();
                    this.toastr.error(response.message, 'Error');
                    this.router.navigate(['/login']);
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }

    }

    addMultipleHistory(history) {
        if (history.length > 0) {
            this.spinnerService.show();
            let url = `service/change-history`;
            let data: any = {
                all_history: history
            };
            data.add_type = 'multiple';

            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.success) {
                        if (response.status == 1) {
                            this.getHistoryList(this.activityDetails);
                        }
                    } else {
                        this.toastr.error(response.error, 'Error');
                    }
                } else {
                    this.spinnerService.hide();
                    this.toastr.error(response.message, 'Error');
                    this.router.navigate(['/login']);
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }

    }

    //EXPORT FUNCTIONALITY
    exportRecords(template) {
        this.exoprtBtnDisable = false;
        this.selectedFields = [];
        this.exportReportColumns = [
            { name: "Project", isEnable: true, fieldNum: "field1" },
            { name: "Unit", isEnable: true, fieldNum: "field2" },
            { name: "Status", isEnable: true, fieldNum: "field3" },
            { name: "Priority", isEnable: true, fieldNum: "field4" },
            { name: "Tags", isEnable: true, fieldNum: "field5" },
            { name: "Deficiency Type", isEnable: true, fieldNum: "field6" },
            { name: "Title", isEnable: true, fieldNum: "field7" },
            { name: "Reported On", isEnable: true, fieldNum: "field8" },
            { name: "Reported By", isEnable: true, fieldNum: "field9" },
            { name: "Due Date", isEnable: true, fieldNum: "field10" },
            { name: "Assignee", isEnable: true, fieldNum: "field11" }

        ];
        this.exportReportColumns.forEach(element => {
            let obj = { label: element.name, id: element.id }
            this.selectedFields.push(obj);
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    async exportDeficiencies() {
        this.exoprtBtnDisable = true;
        this.spinnerService.show();
        this.contributionListForExport = [];
        let page = 1;
        let pageSize = 250;
        let totalPages = Math.ceil(this.paginationObj.total / pageSize);
        for (var i = 0; i < totalPages; i++) {
            let data = await this.getDefeciencyForExport(page, pageSize);
            this.contributionListForExport = this.contributionListForExport.concat(data);
            page++;
        }
        let data = [];
        var options = {
            fieldSeparator: ",",
            quoteStrings: '"',
            decimalSeparator: ".",
            showLabels: true,
            showTitle: true,
            filename: "Deficiency_Report",
            title: "Deficiency Report",
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: false,
            headers: this.selectedFields.map((ele) => ele.label),
        };
        this.csvExporter = new ExportToCsv(options);
        this.contributionListForExport.forEach(element => {
            if (element) {
                let reportObj: any = {};
                this.selectedFields.forEach((field) => {
                    if (field.label == "Project") {
                        reportObj.project_name = element.project_name;;
                    }
                    if (field.label == "Unit") {
                        reportObj.unit_no = element.unit_no ? element.unit_no : '';
                    }
                    if (field.label == "Status") {
                        reportObj.status = element.status ? element.status : '';
                    }
                    if (field.label == "Priority") {
                        reportObj.priority = element.priority ? element.priority : '';
                    }
                    if (field.label == "Deficiency Type") {
                        reportObj.deficiency_type = element.deficiency_type ? element.deficiency_type : '';
                    }

                    if (field.label == "Title") {
                        reportObj.title = element.title ? element.title : '';
                    }

                    if (field.label == "Reported On") {
                        reportObj.opened_at = element.opened_at ? moment(element.opened_at).format('YYYY-MM-DD')  : '';
                    }
                    if (field.label == "Reported By") {
                        reportObj.opened_by = element.opened_by ? element.opened_by : '';
                    }
                    if (field.label == "Due Date") {
                        reportObj.due_date = element.due_date ? moment(element.due_date).format('YYYY-MM-DD')  : '';
                    }

                    if (field.label =='Assignee') {
                        reportObj.assignee_name = element.assignee_name ? element.assignee_name : '';
                    }

                    if (field.label == "Tags") {
                        let name = '';
                        if (element.tags) {
                            element.tags.forEach(element => {
                                name = name ? name + `\n${element}` : element.trim();
                            });
                        }
                        reportObj.tags = `${name}`;
                    }

                });
                data.push(reportObj);
            }
        });
        this.spinnerService.hide();
        this.csvExporter.generateCsv(data);
        this.modalRef.hide();
    }


    getDefeciencyForExport(page, pageSize) {
        return new Promise(resolve => {
            let url = `service/deficiencies?page=${page}&pageSize=${pageSize}`;
            if (this.sortedtby)
                url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
            if (this.filterForm.searchText)
                url = url + `&searchText=${this.filterForm.searchText}`;
            if (this.filterForm.date_filter) {
                url = url + `&date_type=${this.filterForm.date_filter}`;
            }
            if (this.filterForm.month && this.filterForm.startDate) {
                // url = url + `&date_type=${this.filterForm.date_filter}`;
                url = this.filterForm.endDate ? url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}` : url + `&start_date=${this.filterForm.startDate}`;
            }
            if (this.filterForm.project_id) {
                url = url + `&project_id=${this.filterForm.project_id}`;
            }
            if (this.filterForm.priority.length > 0) {
                const values = this.filterForm.priority.map((ele) => ele.name);
                const valueString = values.join();
                url = url + `&priority=${valueString}`;
            }
            if (this.filterForm.status.length > 0) {
                const values = this.filterForm.status.map((ele) => ele);
                const valueString = values.join();
                url = url + `&status=${valueString}`;
            }
            if (this.filterForm.opened_by.length > 0) {
                const values = this.filterForm.opened_by.map((ele) => ele.user_id);
                const valueString = values.join();
                url = url + `&opened_by=${valueString}`;
            }
            if (this.filterForm.assignee_name.length > 0) {
                const values = this.filterForm.assignee_name.map((ele) => ele.user_id);
                const valueString = values.join();
                url = url + `&assignee=${valueString}`;
            }
            this.webService.get(url).subscribe((response: any) => {
                if (response.is_valid_session) {
                    if (response.success) {
                        let data = response.results ? response.results : [];
                        resolve(data);
                    } else {
                        resolve({});
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: `service` } });
                }
            }, (error) => {
                console.log('error', error);
            });
        })
    }

    selectFields(item, i) {
        if (item.isEnable) {
            let obj = { label: item.name, id: item.id ? item.id : '' }
            this.selectedFields.push(obj);
        }
        else {
            let arrIndex = this.selectedFields.findIndex(element => element.label == item.name);
            if (arrIndex > -1) {
                this.selectedFields.splice(arrIndex, 1);
            }
        }
    }

    //SEND EMAIL
    openSendEmail(template: TemplateRef<any>){
        this.formDetails = {
            to: '',
            subject: '',
            body: ''
         };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }
    
    sendEmail(){
        if (!this.formDetails.to) {
            this.toastr.warning('Please enter email(s)', 'Warning');
            return;
        }

        if (!this.formDetails.subject) {
            this.toastr.warning('Please enter subject', 'Warning');
            return;
        }

        if (!this.formDetails.body) {
            this.toastr.warning('Please enter body', 'Warning');
            return;
        }
        // let emails =[];
        //  emails= this.formDetails.to ? this.formDetails.to.split('\n') :[];
        // let data:any={};
        // data.to=emails;
        // data.subject=this.formDetails.subject;
        // data.body= this.formDetails.body;
        // console.log('sendEmail',data);
        this.createFile();
       
    }


    //CREATE ATTACHMENTS FILE
    async createFile() {
        this.spinnerService.show();
        try{
        this.selectedFields = [
            { name: "Project", isEnable: true, fieldNum: "field1" },
            { name: "Unit", isEnable: true, fieldNum: "field2" },
            { name: "Status", isEnable: true, fieldNum: "field3" },
            { name: "Priority", isEnable: true, fieldNum: "field4" },
            { name: "Tags", isEnable: true, fieldNum: "field5" },
            { name: "Deficiency Type", isEnable: true, fieldNum: "field6" },
            { name: "Title", isEnable: true, fieldNum: "field7" },
            { name: "Reported On", isEnable: true, fieldNum: "field8" },
            { name: "Reported By", isEnable: true, fieldNum: "field9" },
            { name: "Due Date", isEnable: true, fieldNum: "field10" },
            { name: "Assignee", isEnable: true, fieldNum: "field11" }

        ];

        this.spinnerService.show();
        this.contributionListForExport = [];
        let page = 1;
        let pageSize = 250;
        let totalPages = Math.ceil(this.paginationObj.total / pageSize);
        for (var i = 0; i < totalPages; i++) {
            let data = await this.getDefeciencyForExport(page, pageSize);
            this.contributionListForExport = this.contributionListForExport.concat(data);
            page++;
        }
        let data = [];
        var options = {
            fieldSeparator: ",",
            quoteStrings: '"',
            decimalSeparator: ".",
            showLabels: true,
            showTitle: true,
            filename: "Deficiency Report",
            title: "Deficiency Report",
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: false,
            headers: this.selectedFields.map((ele) => ele.name),
        };
        this.csvExporter = new ExportToCsv(options);
        this.contributionListForExport.forEach(element => {
            if (element) {
                let reportObj: any = {};
                this.selectedFields.forEach((field) => {
                    if (field.name == "Project") {
                        reportObj.project_name = element.project_name;;
                    }
                    if (field.name == "Unit") {
                        reportObj.unit_no = element.unit_no ? element.unit_no : '';
                    }
                    if (field.name == "Status") {
                        reportObj.status = element.status ? element.status : '';
                    }
                    if (field.name == "Priority") {
                        reportObj.priority = element.priority ? element.priority : '';
                    }
                    if (field.name == "Deficiency Type") {
                        reportObj.deficiency_type = element.deficiency_type ? element.deficiency_type : '';
                    }

                    if (field.name == "Title") {
                        reportObj.title = element.title ? element.title : '';
                    }

                    if (field.name == "Reported On") {
                        reportObj.opened_at = element.opened_at ? moment(element.opened_at).format('YYYY-MM-DD')  : '';
                    }
                    if (field.name == "Reported By") {
                        reportObj.opened_by = element.opened_by ? element.opened_by : '';
                    }
                    if (field.name == "Due Date") {
                        reportObj.due_date = element.due_date ? moment(element.due_date).format('YYYY-MM-DD')  : '';
                    }

                    if (field.name =='Assignee') {
                        reportObj.assignee_name = element.assignee_name ? element.assignee_name : '';
                    }

                    if (field.name == "Tags") {
                        let name = '';
                        if (element.tags) {
                            element.tags.forEach(element => {
                                name = name ? name + `\n${element}` : element.trim();
                            });
                        }
                        reportObj.tags = `${name}`;
                    }

                });
                data.push(reportObj);
            }
        });
        this.spinnerService.hide();
        let csvFile= this.csvExporter.generateCsv(data,true);
        let formData = new FormData();
        let emails =[];
        emails= this.formDetails.to ? this.formDetails.to.split('\n') :[];
        // console.log(emails.join());
        if(csvFile){
            formData.append('file', csvFile);
            formData.append('to', emails.join());
            formData.append('subject', this.formDetails.subject);
            formData.append('body', this.formDetails.body);
        }
        else{
            formData.append('file', csvFile);
            formData.append('to', emails.join());
            formData.append('subject', this.formDetails.subject);
            formData.append('body', this.formDetails.body);
        }
        // this.sendMailAPICall(formData);
    }
    catch{
        this.spinnerService.hide();
        console.error('Something went wrong in create file function')
    }
    }

    sendMailAPICall(formData){
        let url = `service/send-email`;
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');

                    }
                } else {
                    this.toastr.error(response.error, 'Error');
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login']);
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        })
    }
}
