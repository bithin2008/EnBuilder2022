import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.css']
})
export class ChecklistsComponent implements OnInit {
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  private projectSubscription: Subscription;
  @Input() projectListEvent: Observable<void>;

  filterForm: any = {
        location: '',
        project_id: ''
    };
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    isClear: boolean = false;
    locationList: any[] = [];
    @Input() projectList: any = [];
    checkList: any[] = [];
    potentialIssues: any = [
        {
            potential_issue: ''
        },
        {
            potential_issue: ''
        },
        {
            potential_issue: ''
        }
    ];
    isEdit = false;
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
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
    // this.getProjectList();

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
          this.filterForm.project_id = this.projectList.length>0 ? this.projectList[0]._id : '';
          let data = {
              project_id: this.filterForm.project_id,
          }
          this.projectChanged.emit(data);
      }
  }
  else {
      this.filterForm.project_id = this.projectList.length>0 ? this.projectList[0]._id : '';
      let data = {
          project_id: this.filterForm.project_id,
      }
      this.projectChanged.emit(data);
  }

  let filterData: any = localStorage.getItem('serviceChecklistsFilterData');
  if (filterData) {
      filterData = JSON.parse(filterData);

      if (filterData.location) {
          this.filterForm.location = filterData.location;
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
      this.order = this.sortedtby;
      if (this.sortOrder == 'DESC') {
          this.reverse = true;
      } else {
          this.reverse = false;
      }
  }
  this.getChecklist();
}

getChecklist() {
  this.saveFilter();
  // let url = `service/deficiencies?project_id=${this.filterForm.project_id}`;
  let url = `service/checklists?page=${this.page}&pageSize=${this.pageSize}`;
  if (this.sortedtby)
      url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
  if (this.filterForm.project_id) {
      url = url + `&project_id=${this.filterForm.project_id}`
  }
  if (this.filterForm.location) {
      url = url + `&location=${this.filterForm.location}`
  }
  this.spinnerService.show();
  this.webService.get(url).subscribe((response: any) => {
      this.spinnerService.hide();
      if (response.is_valid_session) {
          if (response.status == 1) {
              this.checkList = response.results ? response.results : [];
              if(this.page >1 && response.results.length==0 && !response.pagination){
                this.page = this.page > 1? this.page-1 :1;
                this.getProjectList()  
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
      }
  }, (error) => {
      console.log('error', error);
  });
}

onProjectChange() {
  this.filterForm.location = '';
  // this.getLocationList();
  this.getChecklist();
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

saveFilter() {
  let data = {
      location: this.filterForm.location,
      page: this.page,
      pageSize: this.pageSize,
      sortby: this.sortedtby,
      sortOrder: this.sortOrder
  }
  localStorage.setItem('serviceChecklistsFilterData', JSON.stringify(data));
}
doPaginationWise(page) {
  this.page = page;
  this.getChecklist();
}

setPageSize() {
  this.page = 1;
  this.getChecklist();
}

////ADD CHECKLIST ////

openAddChecklist(template: TemplateRef<any>) {
  this.formDetails = {
    name:'',
    description:'',
    type:'',
    enabled:false,
    project_name:'',
    project_id:this.filterForm.project_id ||''
  };
  this.isEdit = false;
  let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
  this.formDetails.project_name = selectedProject ? selectedProject.name : '';
  this.formDetails.project_id = selectedProject ? selectedProject._id : '';

  this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
}

addCheklist(){
  if (!this.formDetails.project_id) {
        this.toastr.warning('Please select project', 'Warning');
        return;
  }
  if (!this.formDetails.name) {
    this.toastr.warning('Please select name', 'Warning');
    return;
  }

  let url = `service/checklists`;

  let selectedProject = this.projectList.find((data) => data._id == this.formDetails.project_id);

  let data: any = {
      name: this.formDetails.name,
      type: this.formDetails.type,
      description: this.formDetails.description,
      enabled: this.formDetails.enabled ? true : false,
      project_name: selectedProject.name,
      project_id: this.formDetails.project_id

  };
//   console.log('data',data);
  this.spinnerService.show();
  this.webService.post(url, data).subscribe((response: any) => {
      this.spinnerService.hide();
      if (response.status == 1) {
          this.toastr.success(response.message, 'Success');
          this.getChecklist();
          this.modalRef.hide();
      } else {
          this.toastr.error(response.message, 'Error');
      }
  }, (error) => {
      this.spinnerService.hide();
      console.log('error', error);
  });
}

openEditChecklist(template: TemplateRef<any>, item) {
  this.formDetails = Object.assign({}, item);
  this.isEdit = true;
  this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

}

updateChecklist() {
  if (!this.formDetails.project_id) {
        this.toastr.warning('Please select project', 'Warning');
        return;
  }
  if (!this.formDetails.name) {
      this.toastr.warning('Please select name', 'Warning');
      return;
  }
  let url = `service/checklists`;

  let data: any = {
    name: this.formDetails.name,
    type: this.formDetails.type,
    description: this.formDetails.description,
    enabled: this.formDetails.enabled ? true : false,
    _id: this.formDetails._id
  };
  this.spinnerService.show();
  this.webService.post(url, data).subscribe((response: any) => {
      this.spinnerService.hide();
      if (response.status == 1) {
          this.toastr.success(response.message, 'Success');
          this.getChecklist();
          this.modalRef.hide();
      } else {
          this.toastr.error(response.message, 'Error');
      }
  }, (error) => {
      this.spinnerService.hide();
      console.log('error', error);
  });
}

navigateToChecklistDetails(item){
  this.router.navigate(['service/checklist/' + item._id]);

}

ngOnDestroy() {
    if (this.eventsSubscription) {
        this.eventsSubscription.unsubscribe();
    }
    if (this.projectSubscription) {
        this.projectSubscription.unsubscribe();
    }
}


}
