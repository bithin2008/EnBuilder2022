import { Component, OnInit, Input, TemplateRef, Output,EventEmitter } from '@angular/core';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';


@Component({
  selector: 'app-inspcetion-type',
  templateUrl: './inspcetion-type.component.html',
  styleUrls: ['./inspcetion-type.component.css']
})
export class InspcetionTypeComponent implements OnInit {
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;

  filterForm: any = {
      project_id: ''
  };
  itemsList: any[] = [];
  paginationObj: any = {};
  modalRef: BsModalRef;
  formDetails: any = {};
  sortedtby: any = 'name';
  sortOrder: any = 'ASC';
  page: Number = 1;
  pageSize: Number = 20;
  order: string = 'name';
  reverse: boolean = true;
  isClear: boolean = false;
  @Input() projectList: any = [];
  isEdit: boolean = false;
  @Output() projectChanged: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router,
      private webService: WebService,
      private toastr: ToastrService,
      private modalService: BsModalService,
      private spinnerService: Ng4LoadingSpinnerService,
      private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit(): void {
    //   this.getProjectList();
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
      this.getSavedFilterdata();

  }

  onProjectChange() {
      this.getItemslist();
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

      let filterData: any = localStorage.getItem('serviceSettingsInspcetionTypeFilterData');
      if (filterData) {
          filterData = JSON.parse(filterData);

          if (filterData.page) {
              this.page = filterData.page;
          }
          // if (filterData.searchText) {
          //     this.filterForm.searchText = filterData.searchText;
          //     this.isClear = true;
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
     
      this.getItemslist();
  }

  getItemslist() {
      this.saveFilter();
      this.spinnerService.show();
      let url = `service/project-settings?type=PROJECT-INSPECTION-TYPES&page=${this.page}&pageSize=${this.pageSize}`;
      if (this.sortedtby)
          url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
      if (this.filterForm.project_id) {
          url = url + `&project_id=${this.filterForm.project_id}`;
      }
      // if (this.filterForm.searchText) {
      //     url = url + `&searchText=${this.filterForm.searchText}`;
      // }
      this.webService.get(url).subscribe((response: any) => {
          this.spinnerService.hide();
          this.itemsList = [];
          if (response.status == 1) {
              this.itemsList = response.results ? response.results : [];
              if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                this.getItemslist()  
            } 

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
      }, (error) => {
          this.spinnerService.hide();
          console.log('error', error);
      });
  }

  saveFilter() {
      let data = {
          // project_id: this.filterForm.project_id,
          // searchText: this.filterForm.searchText,
          page: this.page,
          pageSize: this.pageSize,
          sortby: this.sortedtby,
          sortOrder: this.sortOrder
      }
      localStorage.setItem('serviceSettingsInspcetionTypeFilterData', JSON.stringify(data));
  }

  // doSearch() {
  //     if (this.filterForm.searchText.length > 0) {
  //         this.isClear = true;
  //     } else {
  //         this.isClear = false;
  //     }
  //     this.page = 1;
  //     this.getItemslist();
  // }
  // clearFilter() {
  //     this.page = 1;
  //     this.pageSize = 20;
  //     this.filterForm.searchText = '';
  //     this.isClear = false;
  //     this.getItemslist();
  // }

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
      this.getItemslist();
  }

  doPaginationWise(page) {
      this.page = page;
      this.getItemslist();
  }

  setPageSize() {
      this.page = 1;
      this.getItemslist();
  }

  openAddModal(template: TemplateRef<any>) {
      this.isEdit = false;
      this.formDetails = {};
      let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
      this.formDetails.project_name = selectedProject ? selectedProject.name : '';
      this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

  }

  openEditModal(template: TemplateRef<any>, item) {
      this.isEdit = true;
      this.formDetails = { ...item };
      let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
      this.formDetails.project_name = selectedProject ? selectedProject.name : '';
      this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

  }

  addItem() {
      if (!this.formDetails.name || !this.formDetails.name.trim()) {
          this.toastr.warning('Please enter name', 'Warning');
          return;
      }
      let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);

      let data: any = {
          type: "PROJECT-INSPECTION-TYPES",
          name: this.formDetails.name.trim(),
          project_id: this.filterForm.project_id,
          project_name: selectedProject ? selectedProject.name : ''

      };
      this.spinnerService.show();
      let url = `service/project-settings`;
      this.webService.post(url, data).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.status == 1) {
              this.toastr.success(response.message, 'Success');
              this.getItemslist();
              this.modalRef.hide();
          } else {
              this.toastr.error(response.message, 'Error');
          }
      }, (error) => {
          this.spinnerService.hide();
          console.log('error', error);
      });
  }

  editItem() {
      if (!this.formDetails.name) {
          this.toastr.warning('Please enter name', 'Warning');
          return;
      }
      let data: any = {
          name: this.formDetails.name,
          _id: this.formDetails._id
      };

      this.spinnerService.show();
      let url = `service/project-settings`;
      this.webService.post(url, data).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.status == 1) {
              this.toastr.success(response.message, 'Success');
              this.getItemslist();
              this.modalRef.hide();
          } else {
              this.toastr.error(response.message, 'Error');
          }
      }, (error) => {
          this.spinnerService.hide();
          console.log('error', error);
      });
  }

  deleteItem(item) {
      this.confirmationDialogService.confirm('Delete', `Do you want to delete this ${item.name} item?`)
          .then((confirmed) => {
              if (confirmed) {
                  let url = `service/project-settings?_id=${item._id}`;
                  this.spinnerService.show();
                  this.webService.delete(url).subscribe((response: any) => {
                      this.spinnerService.hide();
                      if (response.status == 1) {
                          this.toastr.success(response.message, 'Success');
                          this.getItemslist();
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

  ngOnDestroy() {
      if (this.eventsSubscription) {
          this.eventsSubscription.unsubscribe();
      }
  }

}
