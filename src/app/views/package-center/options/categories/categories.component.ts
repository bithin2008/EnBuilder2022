import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    projectList: any = [];
    selectedProject: string = '';
    categoryList: any = [];
    formDetails: any = {};
    paginationObj: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    modalRef: BsModalRef;
    reverse: boolean = true;
    isEdit: boolean = false;
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
            console.log();
            if (response) {
                this.selectedProject = response._id;
                this.onProjectChange();
            }
            else {
                this.selectedProject = '';
                this.onProjectChange();
            }
        });
    }


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
    getProjectList() {
        this.spinnerService.show();
        let url = `package-center/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                if (this.projectList.length > 0) {
                    // this.selectedProject = this.projectList[0]._id;
                    this.getSavedFilterdata();
                    this.getCategoryList();
                }
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('packageCenterProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData && projectData._id) {
                this.selectedProject = projectData._id;
            }
        }
        let filterData: any = localStorage.getItem('packageCategoriesFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            // if (filterData.project_id) {
            //     this.selectedProject = filterData.project_id;
            // } else {
            //     this.selectedProject = this.projectList[0]._id;
            // }
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

    }
   
    onProjectChange() {
        this.getCategoryList();
    }

    getCategoryList() {
        this.saveFilter();
        let url = `package-center/options-categories?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.categoryList = [];
            if (response.status == 1) {
                this.categoryList = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1? this.paginationObj.totalPages-1 :1;
                    this.getCategoryList()  
                }      
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
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    reArrangeCategoryOrder(event, direction, index) {
        event.stopPropagation();
        if (direction == 'up') {
            let previous = { ...this.categoryList[index - 1] };
            let current = { ...this.categoryList[index] };
            let payload = {
                data: [
                    {
                        _id: previous._id,
                        order: previous.order + 1
                    },
                    {
                        _id: current._id,
                        order: current.order - 1
                    }
                ]
            }
            this.onOrderChange(payload);

        }
        else if (direction == 'down') {
            let next = { ... this.categoryList[index + 1] };
            let current = { ...this.categoryList[index] };
            let payload = {
                data: [
                    {
                        _id: next._id,
                        order: next.order - 1
                    },
                    {
                        _id: current._id,
                        order: current.order + 1
                    }
                ]
            }
            this.onOrderChange(payload);
        }
    }
    
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            // project_id: this.selectedProject
        }
        localStorage.setItem('packageCategoriesFilterData', JSON.stringify(data));
    }

    goToCategoryDetails(item) {
        // this.router.navigate(['package-center/packages/' + item.project_id + '/' + item._id]);
        // this.router.navigate(['package-center/packages/' + item._id]);
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
        this.getCategoryList();
    }

    openAddCategoryModal(template: TemplateRef<any>) {
        this.formDetails = {
            project_id: this.selectedProject,
            name: '',
            // sub_categories: '',
            description: '',
            is_active: false,
            order: this.categoryList.length + 1
        }
        this.isEdit = false;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    addCategory() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        let data = { ...this.formDetails };
        // if (this.formDetails.sub_categories.trim()) {

        //     try {

        //         if ((this.formDetails.sub_categories.indexOf(',')) != -1) {
        //             let sub_categories = this.formDetails.sub_categories.split(',');
        //             let trimedSubCategories = [];
        //             sub_categories.forEach((category) => {
        //                 trimedSubCategories.push(category.trim());

        //             });
        //             data.sub_categories = trimedSubCategories;
        //         }
        //         else {
        //             let subCategories = this.formDetails.sub_categories.split(',');
        //             data.sub_categories = subCategories.length > 0 ? subCategories : [];
        //         }
        //     }
        //     catch{
        //         this.toastr.warning('Enter valid input for sub categories', 'Warning');
        //     }
        // }
        // else {
        //     data.sub_categories = [];
        // }

        let selectedProject = this.projectList.filter((element) => element._id == this.formDetails.project_id);
        if (selectedProject && selectedProject.length > 0) {
            data.project_name = selectedProject[0].name;
            let url = `package-center/options-categories`;
            // console.log(data);
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getCategoryList();
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {
            this.toastr.warning('Please select valid project', 'Warning');
        }
    }

    openEditCategoryModal(template: TemplateRef<any>, item) {
        this.formDetails = Object.assign({}, item);
        this.isEdit = true;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateCategory() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        let data: any = {
            project_id: this.formDetails.project_id,
            name: this.formDetails.name,
            description: this.formDetails.description,
            is_active: this.formDetails.is_active ? true : false,
            order: this.formDetails.order,
            _id: this.formDetails._id
        };
        let selectedProject = this.projectList.filter((element) => element._id == this.formDetails.project_id);
        if (selectedProject && selectedProject.length > 0) {
            data.project_name = selectedProject[0].name;
            let url = `package-center/options-categories`;
            // console.log(data);
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getCategoryList();
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {
            this.toastr.warning('Please select valid project', 'Warning');
        }
    }

    //DELETE PACKAGE
    deleteCategory(event, item) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} category ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/options-categories?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getCategoryList();
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


    onOrderChange(data) {
        this.spinnerService.show();
        let url = `package-center/rearrange-options-categories`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getCategoryList();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onStatusChange(item) {
        let data: any = {};
        data.is_active = item.is_active ? true : false;
        data._id = item._id;
        let url = `package-center/options-categories`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                // this.getColorCollectionList();
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
        this.getCategoryList();
    }

    setPageSize() {
        this.page = 1;
        this.getCategoryList();
    }
}
