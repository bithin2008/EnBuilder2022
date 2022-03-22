import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-color-collections-list',
    templateUrl: './color-collections-list.component.html',
    styleUrls: ['./color-collections-list.component.css']
})
export class ColorCollectionsListComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    projectList: any = [];
    selectedProject: string = '';
    colorCollections: any = [];
    formDetails: any = {};
    paginationObj: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    isEdit: boolean = false;
    modalRef: BsModalRef;
    reverse: boolean = true;
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
            // console.log('xxx',response);
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


    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('packageCenterProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData && projectData._id) {
                this.selectedProject = projectData._id;
            }
            else {
                // this.selectedProject = this.projectList[0]._id;
            }
        }
        else {
            // this.selectedProject = this.projectList[0]._id;
        }

        let filterData: any = localStorage.getItem('colorCollectionFilterData');
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
                    this.getColorCollectionList();
                }
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onProjectChange() {
        this.getColorCollectionList();
    }

    getColorCollectionList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `package-center/color-collections?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.colorCollections=[];
            if (response.status == 1) {
                this.colorCollections = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                    this.getColorCollectionList()  
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

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            // project_id: this.selectedProject
        }
        localStorage.setItem('colorCollectionFilterData', JSON.stringify(data));
    }

    goToCollectionDetails(item) {
        // this.router.navigate(['package-center/color-collections/' + item.project_id + '/' + item._id]);
        this.router.navigate(['package-center/color-collections/' + item._id]);
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
        this.getColorCollectionList();
    }

    openAddCollectionDetailsModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            project_id: this.selectedProject,
            name: '',
            // cost: null,
            // price: null,
            description: '',
            is_active: false,
            order: this.colorCollections.length + 1
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    async addColorCollection() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        // if (!this.formDetails.cost && this.formDetails.cost != 0) {
        //     this.toastr.warning(`Please enter cost`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.cost < 0) {
        //     this.toastr.warning(`Please enter cost greater than and equal to 0`, 'Warning');
        //     return;
        // }
        // if (!this.formDetails.price && this.formDetails.price != 0) {
        //     this.toastr.warning(`Please enter price`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.price < 0) {
        //     this.toastr.warning(`Please enter price greater than and equal to 0`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.cost > this.formDetails.price) {
        //     let confirmed = await this.confirmationDialogService.confirm('Confirm', `Cost is greater than price, Do you want to continue ?`)
        //     if (!confirmed) {
        //         return;
        //     }
        // }
        let selectedProject = this.projectList.filter((element) => element._id == this.formDetails.project_id);
        if (selectedProject && selectedProject.length > 0) {
            let data = { ...this.formDetails };
            data.project_name = selectedProject[0].name;
            let url = `package-center/color-collections`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getColorCollectionList();
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

    deleteColorCollection(event, item) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} collection?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/color-collections?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getColorCollectionList();
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

    reArrangeProgressStep(event, direction, index) {
        event.stopPropagation();
        if (direction == 'up') {
            let previous = { ...this.colorCollections[index - 1] };
            let current = { ...this.colorCollections[index] };
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
            let next = { ... this.colorCollections[index + 1] };
            let current = { ...this.colorCollections[index] };
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

    onOrderChange(data) {
        this.spinnerService.show();
        let url = `package-center/rearrange-color-collection`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionList();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    doPaginationWise(page) {
        this.page = page;
        this.getColorCollectionList();
    }

    setPageSize() {
        this.page = 1;
        this.getColorCollectionList();
    }

    onStatusChange(item) {
        let data: any = {};
        data.is_active = item.is_active ? true : false;
        data._id = item._id;
        let url = `package-center/color-collections`;
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
}
