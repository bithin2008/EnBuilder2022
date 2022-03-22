import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-layout-customizations',
  templateUrl: './layout-customizations.component.html',
  styleUrls: ['./layout-customizations.component.css']
})
export class LayoutCustomizationsComponent implements OnInit {
  filterForm:any={
    project_id:'',
    unit_id:'',
    unit:{
      unit_no:''
    }
  }
  sortedtby: any = '_created';
  sortOrder: any = 'DESC';
  page: Number = 1;
  pageSize: Number = 20;
  order: string = '_created';
  unitList:any[]=[];
  projectList:any=[];
  paginationObj:any={};
  layoutCustomizations:any[]=[];
  reverse: boolean = true;
  unitData:any=''
  constructor(
    private router: Router,
    private webService: WebService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private spinnerService: Ng4LoadingSpinnerService,
    private confirmationDialogService: ConfirmationDialogService,

  ) { }

  ngOnInit(): void {
    this.getAllProjectList();
  }

  getSavedFilterdata() {
    let filterData: any = localStorage.getItem('purchaserLayoutCustomizationFilterData');
    if (filterData) {
        filterData = JSON.parse(filterData);
        if (filterData.project_id) {
            this.filterForm.project_id = filterData.project_id;
        }
        if (filterData.unit) {
            this.filterForm.unit_id = filterData.unit.unit_id;
            this.filterForm.unit={
              unit_no : filterData.unit.unit_no,
              unit_id : filterData.unit.unit_id
            }
            this.unitData=filterData.unit_no;
        }
        else{
          this.unitData=''
        }
        // this.getUnitList({query:this.unitData});
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

        // if (filterData.searchText) {
        //     this.filterForm.searchText = filterData.searchText;
        //    // this.isClear = true;
        // }
        this.order = this.sortedtby;
        if (this.sortOrder == 'DESC') {
            this.reverse = true;
        } else {
            this.reverse = false;
        }
    }
    this.getLayoutCustomization();
  }


  ////// CUSTOMIZATION LAYOUT ///////
  getLayoutCustomization() {
    this.saveFilters();
    let url = `purchaser-portal/layout-customizations?page=${this.page}&pageSize=${this.pageSize}`;
    if (this.sortedtby)
    url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
    if (this.filterForm.project_id) {
        url = url + `&project_id=${this.filterForm.project_id}`;
    }

    if (this.filterForm.project_id && this.filterForm.unit_id) {
      url = url + `&unit_id=${this.filterForm.unit_id}`;
    }
    this.spinnerService.show();
    this.layoutCustomizations=[];
    this.webService.get(url).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.status == 1) {
            if (response.results && response.results.length > 0) {
               this.layoutCustomizations= response.results;
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

  ///// PAGINATION //////
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
    this.getLayoutCustomization();
  }

  setPageSize(){
    this.page = 1;
    this.getLayoutCustomization();

  }

  doPaginationWise(page){
    this.page = page;
    this.getLayoutCustomization();
  }

  ///// FILTERS //////
  getAllProjectList() {
    this.projectList = [];
    this.spinnerService.show();
    let url = `purchaser-portal/projects?page=1&pageSize=100`;
    this.webService.get(url).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.is_valid_session) {
            if (response.status == 1) {
                this.projectList = response.results;
                this.getSavedFilterdata();
            }
        } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login'], { queryParams: { return_url: '' } });
        }
    }, (error) => {
        console.log('error', error);
    });
  }

  projectFilterChange(){
    this.page = 1;
    this.filterForm.unit_id ='';
    this.filterForm.unit={
      unit_no:'',
      unit_id:''
    };
    this.unitList=[];
    this.getLayoutCustomization();
  }

  autocompleteChange(value){
      if(value){
        //functionality on keyup event
      }
      else{
        this.filterForm.unit_id ='';
        this.filterForm.unit={
          unit_no:'',
          unit_id:''
        };
        this.getLayoutCustomization();
      }
  }

  getUnitList(event){
    let url = `purchaser-portal/units?project_id=${this.filterForm.project_id}&unit_no=${event.query ? event.query : this.unitData}`;

    // this.spinnerService.show();
    this.webService.get(url).subscribe((response: any) => {
        // this.spinnerService.hide();
        if (response.status == 1) {
            this.unitList=(response.results && response.results.rows) ? response.results.rows :[];
        }
    }, (error) => {
        // this.spinnerService.hide();
        console.log('error', error);
    });
  }


  unitSelection(val) {
    this.filterForm.unit_id = val._id;
    this.filterForm.unit={
      unit_no : val.unit_no,
      unit_id : val._id
    }
    this.page = 1;
    this.getLayoutCustomization();
    // console.log('val',val);
    // localStorage.setItem('save_unit_id', this.searchData.unit_id ? this.searchData.unit_id : '');
  }

  unitFilterChange(){
    this.getLayoutCustomization();
  }

  clearFilter(){
    this.page = 1;
    this.pageSize = 20;
    this.unitList=[];
    this.filterForm.project_id = '';
    this.filterForm.unit_id ='';
    this.filterForm.unit = {
      unit_id:'',
      unit_no:''
    };
    this.getLayoutCustomization();
  }

  saveFilters(){
    let data = {
      page: this.page,
      pageSize: this.pageSize,
      project_id: this.filterForm.project_id,
      sortby: this.sortedtby,
      sortOrder: this.sortOrder,
      unit: this.filterForm.unit,
      // searchText: this.filterForm.searchText,
  }
  localStorage.setItem('purchaserLayoutCustomizationFilterData', JSON.stringify(data));
  }

  openUnitDetailsPage(item){
    if(item.unit_id){
    localStorage.setItem('purchaserUnitsActiveTab', 'layoutCustomizationTab');
    this.router.navigate(['purchaser-admin/unit-details/' + item.unit_id]);
  }
 }
}
