import { Component, OnInit, TemplateRef, Input, Output,EventEmitter } from '@angular/core';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    colspanValue: number = 3;
    ueserList: any = [];
    paginationObj: any = {};
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        project_id: '',
        searchText:''
    };
    @Input() projectList: any[] = [];
    selectedAllUser: boolean = false;
    contactList: any = [];
    rolesList: any[] = [];
    userPaginationObj:any={};
    userPage: Number = 1;
    userPageSize:number=20;
    useSortOrder: any = 'DESC';
    userSortBy: string = '_updated';
    userUreverse: boolean = true;
    isClear:boolean=false;
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.getSavedFilterdata();
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

        let filterData: any = localStorage.getItem('serviceSettingsUserFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);

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

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
       
        this.getRolesList();

    }

    onProjectChange() {
        this.getRolesList();
    }
    getUsers() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `service/users?page=${this.page}&pageSize=${this.pageSize}&project_id=${this.filterForm.project_id}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.ueserList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.ueserList = response.results ? response.results : [];
                    if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                        this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                        this.getUsers()  
                    } 
    
                    this.ueserList.forEach(element => {
                        this.rolesList.forEach(role => {
                            // console.log('element[role] ', element[role.name]);
                            if (role.name) {
                                let role_ = role.name.toUpperCase()
                                element[role.name] = element.roles.indexOf(role_) != -1 ? true : false;
                            }
                        })
                        // if (element.roles.indexOf('MANAGER') != -1) {
                        //     element.is_manager = true;
                        // }
                        // if (element.roles.indexOf('APPROVER') != -1) {
                        //     element.is_approver = true;
                        // }
                        // if (element.roles.indexOf('ASSIGNEE') != -1) {
                        //     element.is_assignee = true;
                        // }
                        // if (element.roles.indexOf('TRADE') != -1) {
                        //     element.is_trade = true;
                        // }
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

    getRolesList() {
        this.spinnerService.show();
        let url = `service/crm-settings?type=SERVICE_USER_ROLES&page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortbBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.rolesList = [];
                let rolesList = (response.results && response.results[0] && response.results[0].roles) ? response.results[0].roles : [];
                rolesList.forEach(element => {
                    let obj = { name: element }
                    this.rolesList.push(obj);
                });
                this.colspanValue = 3 + this.rolesList.length;
                // console.log('this.rolesList', this.rolesList);

                this.getUsers();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder
            // project_id: this.filterForm.project_id
        }
        localStorage.setItem('serviceSettingsUserFilterData', JSON.stringify(data));
    }

    getContacts() {
        let url = `service/contacts?page=${this.userPage}&pageSize=${this.userPageSize}&project_id=${this.filterForm.project_id}`;
        if (this.userSortBy)
            url = url + `&sortBy=${this.userSortBy}&sortOrder=${this.useSortOrder}`;
        if (this.filterForm.searchText && this.filterForm.searchText.trim())
                url = url + `&searchText=${this.filterForm.searchText.trim()}`;

        this.spinnerService.show();
            this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.contactList = response.results ? response.results : [];
                    if (response.pagination) {
                        this.userPaginationObj = response.pagination;
                    }
                    else
                        this.userPaginationObj = {
                            total: 0
                        };
                } else {
                    this.userPaginationObj = {
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

    selectAllUser() {
        for (var i = 0; i < this.contactList.length; i++) {
            this.contactList[i].is_selected = this.selectedAllUser;
        }
    }

    addBulkUsers() {
        let selectedElements = this.contactList.filter(element => element.is_selected);
        if (selectedElements.length == 0) {
            this.toastr.warning('Please select contact', 'Warning');
            return;
        }
        let selectedProject = this.projectList.find(element => element._id == this.formDetails.project_id);
        let users = [];
        selectedElements.forEach(element => {
            let obj: any = {
                roles: []
            };
            this.rolesList.forEach(role => {
                // console.log('element[role] ', element[role.name]);
                if (element[role.name] && element[role.name] == true) {
                    let role_ = role.name.toUpperCase()
                    obj.roles.push(role_);
                }
            })
            // if (element.is_manager) {
            //     obj.roles.push('MANAGER')
            // }
            // if (element.is_approver) {
            //     obj.roles.push('APPROVER')
            // }
            // if (element.is_assignee) {
            //     obj.roles.push('ASSIGNEE')
            // }
            // if (element.is_trade) {
            //     obj.roles.push('TRADE')
            // }
            obj.project_id = selectedProject._id;
            obj.project_name = selectedProject.name;
            obj.user_id = element._id;
            obj.display_name = element.display_name;
            if (element.emails && element.emails.length > 0) {
                let active_emails = element.emails.filter(email => !email.is_inactive);
                obj.email = active_emails && active_emails.length > 0 ? active_emails[0].email : '';

            } else {
                obj.email = '';
            }
            users.push(obj);
        });
        let url = `service/users`;
        let data: any = {
            users: users
        };
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getUsers();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openAddUser(template: TemplateRef<any>) {
        this.selectedAllUser = false;
        this.contactList = [];
        this.formDetails.project_id = this.filterForm.project_id;
        this.userPaginationObj={};
        this.userPage=1;
        this.userPageSize=20;
        this.getContacts();
        // let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        // this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }


    getProjectList() {
        this.spinnerService.show();
        let url = `service/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;

                this.getSavedFilterdata();
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openEditUsersModal(template: TemplateRef<any>, item) {
        this.formDetails = Object.assign({}, item);
        // this.formDetails.is_manager = this.formDetails.roles.indexOf('MANAGER') != -1 ? true : false;
        // this.formDetails.is_approver = this.formDetails.roles.indexOf('APPROVER') != -1 ? true : false;
        // this.formDetails.is_assignee = this.formDetails.roles.indexOf('ASSIGNEE') != -1 ? true : false;
        // this.formDetails.is_trade = this.formDetails.roles.indexOf('TRADE') != -1 ? true : false;
        this.rolesList.forEach(role => {
            if (role.name) {
                let role_ = role.name.toUpperCase()
                this.formDetails[role.name] = this.formDetails.roles.indexOf(role_) != -1 ? true : false;
            }
        })
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    deleteUser(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.display_name} user?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `service/users?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getUsers();
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

    editUser() {
        let users = [];
        let roles = [];
        this.rolesList.forEach(role => {
            if (this.formDetails[role.name] && this.formDetails[role.name] == true) {
                let role_ = role.name.toUpperCase()
                roles.push(role_);
            }
        })
        // if (this.formDetails.is_manager) {
        //     roles.push('MANAGER')
        // }
        // if (this.formDetails.is_approver) {
        //     roles.push('APPROVER')
        // }
        // if (this.formDetails.is_assignee) {
        //     roles.push('ASSIGNEE')
        // }
        // if (this.formDetails.is_trade) {
        //     roles.push('TRADE')
        // }
        let obj: any = {
            user_id: this.formDetails.user_id,
            project_id: this.formDetails.project_id,
            roles: roles
        };

        users.push(obj);
        let url = `service/users`;
        let data: any = {
            users: users
        };
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getUsers();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    doPaginationWise(page) {
        this.page = page;
        this.getUsers();
    }

    setPageSize() {
        this.page = 1;
        this.getUsers();
    }
    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    //User 
    userSetPageSize(){
        this.userPage = 1;
        this.getContacts();

    }

    doUserPaginationWise(page){
        this.userPage = page;
        this.getContacts();

    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getContacts();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';

        this.getContacts();
    }
}
