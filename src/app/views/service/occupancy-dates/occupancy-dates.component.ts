import { Component, OnInit, TemplateRef, Input, EventEmitter, Output } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Subscription, Observable } from 'rxjs';
import { ExportToCsv } from "export-to-csv";

@Component({
    selector: 'app-occupancy-dates',
    templateUrl: './occupancy-dates.component.html',
    styleUrls: ['./occupancy-dates.component.css']
})
export class OccupancyDatesComponent implements OnInit {
    private eventsSubscription: Subscription;
    private projectSubscription: Subscription;
    @Input() events: Observable<void>;
    @Input() projectListEvent: Observable<void>;
    paginationObj: any = {};
    filterForm: any = {
        searchText: '',
        dateType: '',
        startDate: '',
        endDate: '',
        project_id: ''
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
    dateDiff: any;
    baseUrl = environment.BASE_URL;
    selectedAll: boolean = false;
    modalRef: BsModalRef;
    occupancyDates: any = [];
    isProcessBtnShow: boolean = false;
    occupancyDateTypes: any[] = [
        {
            label: 'Tentative Occupancy',
            value: 'Tentative Occupancy'
        },
        {
            label: 'Firm Occupancy',
            value: 'Firm Occupancy'
        },
        {
            label: 'Final Occupancy',
            value: 'Final Occupancy'
        }
    ];
    exoprtBtnDisable: boolean = false;
    public exportReportColumns: any = [];
    public selectedFields: any = [];
    public csvExporter: any;
    contributionListForExport: any = [];
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,

    ) { }

    ngOnInit(): void {
        // this.getProjectList();
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

        this.projectSubscription = this.projectListEvent.subscribe((response: any) => {
            if (response) {
                this.projectList = response.projects;
            }
            else {
                this.projectList = [];
            }
            this.getSavedFilterdata();
        });

        this.getSavedFilterdata();

    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
        if (this.projectSubscription) {
            this.projectSubscription.unsubscribe();
        }
    }
    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('serviceProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData && projectData._id) {
                this.filterForm.project_id = projectData._id;
                    let selectedProject=projectData;
                    // let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
                    if (selectedProject) {
                        this.occupancyDates = selectedProject.occupancy_dates ? selectedProject.occupancy_dates : [];
                    }
                    else {
                        this.occupancyDates = [];
                    }
            
            }
            else {
                this.filterForm.project_id =this.projectList.length>0 ? this.projectList[0]._id :'';
                this.occupancyDates = this.projectList.length>0 ? this.projectList[0].occupancy_dates ? this.projectList[0].occupancy_dates : [] :[];
                let data = {
                    project_id: this.filterForm.project_id,
                }
                this.projectChanged.emit(data);
            }
        }
        else{
            this.filterForm.project_id =this.projectList.length>0 ? this.projectList[0]._id :'';
            this.occupancyDates = this.projectList.length>0 ? this.projectList[0].occupancy_dates ? this.projectList[0].occupancy_dates : [] :[];
            let data = {
                project_id: this.filterForm.project_id,
            }
            this.projectChanged.emit(data);
        }

        let filterData: any = localStorage.getItem('occupancyDatesFilterData');
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
            if (filterData.dateType) {
                this.filterForm.dateType = filterData.dateType;
            }
            if (filterData.startDate) {
                this.filterForm.startDate = filterData.startDate;
            }
            if (filterData.endDate) {
                this.filterForm.endDate = filterData.endDate;
            }

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getUnitList();
    }

    ngDoCheck() {
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


    onDateFlterChange() {
        if (!this.filterForm.dateType) {
            this.page = 1;
            this.filterForm.startDate = '';
            this.filterForm.endDate = '';
            this.getUnitList();
        }
    }
    onApply() {
        this.page = 1;
        this.getUnitList();
    }
    getUnitList() {
        // if (!this.filterForm.project_id) {
        //     this.unitList = [];
        //     this.paginationObj = {
        //         total: 0
        //     };
        //     this.toastr.warning('Please select project!', 'Warning');
        //     return false;
        // }
        this.saveFilter();
        this.spinnerService.show();
        let url = `service/units?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.dateType && this.filterForm.startDate) {
            url = url + `&date_type=${this.filterForm.dateType}`;
            url = this.filterForm.endDate ? url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}` : url + `&start_date=${this.filterForm.startDate}`;
        }
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitList = response.results ? response.results : [];
                    this.unitList.forEach(element => {
                        element.selected = false;
                    });
                    this.isProcessBtnShow = false;
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
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    doPaginationWise(page) {
        this.page = page;
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
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';

        this.getUnitList();
    }
    setPageSize() {
        this.page = 1;
        this.getUnitList();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            dateType: '',
            startDate: '',
            endDate: ''
        };
        this.isClear = false;
        this.getUnitList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            dateType: this.filterForm.dateType,
            startDate: this.filterForm.startDate,
            endDate: this.filterForm.endDate
            // project_id: this.filterForm.project_id
        }
        localStorage.setItem('occupancyDatesFilterData', JSON.stringify(data));
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

    getProjectList() {
        this.spinnerService.show();
        let url = `service/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;

                // this.getSavedFilterdata();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onProjectChange() {
        // let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        let projectData: any = localStorage.getItem('serviceProjectData');
        if (projectData) {
            let selectedProject =  JSON.parse(projectData);
        if (selectedProject) {
            this.occupancyDates = selectedProject.occupancy_dates ? selectedProject.occupancy_dates : [];
        }
        else {
            this.occupancyDates = [];

        }
    }

        this.getUnitList();
    }

    navigateToContact(id) {
        let url = `#/sales/contact/${id}`;
        window.open(url, '_blank');
    }

    openAssignDatesModal(template: TemplateRef<any>) {
        this.formDetails = {};
        this.formDetails.date_type = '';
        this.formDetails.date = '';
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }
    openAddDateModal(template: TemplateRef<any>) {
        this.formDetails = {};
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }


    selectAll() {
        for (var i = 0; i < this.unitList.length; i++) {
            this.unitList[i].selected = this.selectedAll;
        }
        this.showProcessBtn();
    }

    showProcessBtn() {
        var selected = 0;
        for (var i = 0; i < this.unitList.length; i++) {
            if (this.unitList[i].selected == true) {
                selected++;
            }
        }
        if (selected > 0) {
            this.isProcessBtnShow = true;
        } else {
            this.isProcessBtnShow = false;
        }
    }

    onDateChanged(event) {
        if (event) {
            this.formDetails.date = moment(event).format('YYYY-MM-DD');
        }
    }

    updateAssignDate() {
        let selectedItems = this.unitList.filter((item) => item.selected);
        if (selectedItems && selectedItems.length == 0) {
            this.toastr.warning('Please select unit!', 'Warning');
            return false;
        }
        if (!this.formDetails.date_type) {
            this.toastr.warning('Please select date type!', 'Warning');
            return false;
        }
        if (!this.formDetails.date) {
            this.toastr.warning('Please select date !', 'Warning');
            return false;
        }
        let url = `service/assign-dates`;
        let data: any = {
            date_type: this.formDetails.date_type,
            date: this.formDetails.date ? moment(this.formDetails.date).format('YYYY-MM-DD') : ''
        };
        let units: any = [];
        selectedItems.forEach(element => {
            let obj: any = {};
            obj.unit_id = element._id,
                obj.builder_id = element.builder_id,
                obj.builder_name = element.builder_name,
                obj.model_id = element.model_id,
                obj.model_name = element.model_name,
                obj.project_id = element.project_id,
                obj.project_name = element.project_name,
                obj.unit_no = element.unit_no,
                obj.deal_id = element.deal_id ? element.deal_id : ''
            units.push(obj);
        });
        data.units = units;
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                    this.getUnitList();
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

    addDateType() {
        if (!this.formDetails.date_type) {
            this.toastr.warning('Please select date type!', 'Warning');
            return;
        }
        let similarRecord = this.occupancyDates.filter((element) => element.type == this.formDetails.date_type);
        // console.log('formDetails.date_type', similarRecord);
        let occupancy_date: any = {};
        if (this.formDetails.date_type == 'Tentative Occupancy') {
            occupancy_date = {
                "label": `Tentative ${similarRecord.length + 1} Occupancy`,
                "id": `tentative${similarRecord.length + 1}_occupancy`,
                "type": this.formDetails.date_type
            }

        }
        else if (this.formDetails.date_type == 'Final Occupancy') {
            occupancy_date = {
                "label": `Final ${similarRecord.length + 1} Occupancy`,
                "id": `final${similarRecord.length + 1}_occupancy`,
                "type": this.formDetails.date_type
            }

        }
        else if (this.formDetails.date_type == 'Firm Occupancy') {
            occupancy_date = {
                "label": `Firm ${similarRecord.length + 1} Occupancy`,
                "id": `firm${similarRecord.length + 1}_occupancy`,
                "type": this.formDetails.date_type
            }

        }
        let data: any = {
            _id: this.filterForm.project_id,
            occupancy_date: occupancy_date
        };
        let url = `service/add-dates`;
        // console.log('projects occupancy', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getProjectDetails(data._id);
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

    getProjectDetails(project_id) {
        this.spinnerService.show();
        let url = `service/projects?_id=${project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                let projectDetials = response.result;
                let selectedProject = this.projectList.find((data) => data._id == project_id);
                if (projectDetials) {
                    selectedProject.occupancy_dates = projectDetials.occupancy_dates;
                    this.occupancyDates = projectDetials.occupancy_dates ? projectDetials.occupancy_dates : [];
                }
                else {
                    this.occupancyDates = [];
                }

                this.getUnitList();

            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    exportRecords(template) {
        this.exoprtBtnDisable = false;
        this.selectedFields = [];
        this.exportReportColumns = [
            { name: "Project", isEnable: true, fieldNum: "field1" },
            { name: "Unit", isEnable: true, fieldNum: "field2" },
            { name: "Deal", isEnable: true, fieldNum: "field3" },
            { name: "Name", isEnable: true, fieldNum: "field4" },
            { name: "Email", isEnable: true, fieldNum: "field5" },
            { name: "Phone", isEnable: true, fieldNum: "field6" }

        ];
        this.occupancyDates.forEach((element, index) => {
            let obj = { name: element.label, isEnable: true, fieldNum: `field${7 + index}`, id: element.id }
            this.exportReportColumns.push(obj);
        });
        this.exportReportColumns.forEach(element => {
            let obj = { label: element.name, id: element.id }
            this.selectedFields.push(obj);
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    async exportContribution() {
        this.exoprtBtnDisable = true;
        this.spinnerService.show();
        this.contributionListForExport = [];
        let page = 1;
        let pageSize = 250;
        let totalPages = Math.ceil(this.paginationObj.total / pageSize);
        for (var i = 0; i < totalPages; i++) {
            let data = await this.getContributionsForExport(page, pageSize);
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
            filename: "OccupancyDates_Report",
            title: "OccupancyDates Report",
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
                    if (field.label == "Deal") {
                        reportObj.deal_id = element.deal_id ? element.deal_id : '';
                    }
                    if (field.label && field.id) {
                        reportObj[`${field.id}`] = element[`${field.id}`] ? moment(element[`${field.id}`]).format('YYYY-MM-DD') : '';
                    }

                    if (field.label == "Name") {
                        let name = '';
                        if (element.purchasers) {
                            element.purchasers.forEach(element => {
                                name = name ? name + `\n${element.display_name}` : element.display_name.trim();
                            });
                        }
                        reportObj.name = `${name}`;
                    }
                    if (field.label == "Email") {
                        let emails = '';
                        if (element.purchasers) {
                            element.purchasers.forEach(element => {
                                // if (element.emails) {
                                //     emails = element.emails[0] ? emails ? emails + `\n${element.emails[0].email}` : element.emails[0].email.trim() : '';
                                // }
                                if (element.emails && element.emails.length > 0) {
                                    let keepGoing = true;
                                    element.emails.forEach(email => {
                                        if (keepGoing) {
                                            if (!email.is_inactive) {
                                                emails = emails ? emails + `\n${email.email}` : email.email.trim();
                                                keepGoing = false;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        reportObj.emails = `${emails}`;
                    }
                    if (field.label == "Phone") {
                        let phones = '';
                        if (element.purchasers) {
                            element.purchasers.forEach(element => {
                                // if (element.phones) {
                                // phones = element.phones[0] ? phones ? phones + `\n${element.phones[0].formatted}` : element.phones[0].formatted.trim() : '';
                                // }
                                if (element.phones && element.phones.length > 0) {
                                    let keepGoing = true;
                                    element.phones.forEach(phone => {
                                        if (keepGoing) {
                                            if (!phone.is_inactive) {
                                                phones = phones ? phones + `\n${phone.formatted}` : phone.formatted.trim();
                                                keepGoing = false;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        reportObj.phones = `${phones}`;
                    }
                });
                data.push(reportObj);
            }
        });
        this.spinnerService.hide();
        this.csvExporter.generateCsv(data);
        this.modalRef.hide();
    }


    getContributionsForExport(page, pageSize) {
        return new Promise(resolve => {
            let url = `service/units?page=${page}&pageSize=${pageSize}`;
            if (this.sortedtby)
                url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
            if (this.filterForm.searchText)
                url = url + `&searchText=${this.filterForm.searchText}`;
            if (this.filterForm.dateType && this.filterForm.startDate) {
                url = url + `&date_type=${this.filterForm.dateType}`;
                url = this.filterForm.endDate ? url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}` : url + `&start_date=${this.filterForm.startDate}`;
            }
            if (this.filterForm.project_id) {
                url = url + `&project_id=${this.filterForm.project_id}`;
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
}
