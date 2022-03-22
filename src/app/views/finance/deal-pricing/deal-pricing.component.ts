import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-deal-pricing',
  templateUrl: './deal-pricing.component.html',
  styleUrls: ['./deal-pricing.component.css']
})
export class DealPricingComponent implements OnInit {
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  sortedtby: any = '_created';
  sortOrder: any = 'DESC';
  page: Number = 1;
  pageSize: Number = 20;
  filterForm = {
      project_id: '',
    //   builder_id: '',
      searchText: ''
      // model_id: [],
      // beds: [],
      // baths: [],
      // den: [],
      // media: [],
      // flex: [],
      // floor_legal: [],
      // collection: [],
      // type: []
  }
  dynamicColumns:any=[
    {
        fieldNum:'price',
        name:'Base Price',
        isEnable:false
    },
    {
      fieldNum:'priceSqFt',
      name:`Price per Sq.Ft`,
      isEnable:false
    },
    {
        fieldNum:'unit_premium',
        name:'Unit Premium',
        isEnable:false
    },
    {
        fieldNum:'floor_premium',
        name:'Floor Premium',
        isEnable:false
    },
    {
      fieldNum:'net_price',
      name:'Net Price',
      isEnable:false
    },
    {
        fieldNum:'sales_price',
        name:'Sales Price',
        isEnable:false
    },
    {
      fieldNum:'total_discount',
      name:'Total Discounts',
      isEnable:false
    },
    {
      fieldNum:'contract_price',
      name:'Contract Price',
      isEnable:false
      },
    {
      fieldNum:'tax',
      name:'Tax',
      isEnable:false
    },
    {
      fieldNum:'parking_price',
      name:'Parking Price',
      isEnable:false
      },
    {
      fieldNum:'locker_price',
      name:'Locker Price',
      isEnable:false
    },
    {
      fieldNum:'bicycle_price',
      name:'Bicycle Price',
      isEnable:false
    },
     {
      fieldNum:'nsf_fee_paid',
      name:'Total NSF Fee Paid',
      isEnable:false
    },
    {
      fieldNum:'nsf_count',
      name:'NSF Count',
      isEnable:false
    },
     {
      fieldNum:'total_penalty',
      name:'Total Penalty',
      isEnable:false
    },
    
  ];
  projectDetails:any={};
  colSpanVal:number=2;
  formDetails:any={};
  baseUrl = environment.BASE_URL;
  isClear: boolean = false;
  order: string = '_created';
  reverse: boolean = true;
  measureUnits: any[] = [];
  dealPricingList:any[]=[];
  paginationObj: any = {};
  modalRef: BsModalRef;
  @Output() projectChanged: EventEmitter<any> = new EventEmitter();
  constructor(private router: Router,
    private webService: WebService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private spinnerService: Ng4LoadingSpinnerService)
    {}

  ngOnInit(): void {
    this.getSavedFilterdata();
    this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];
    // let priceUnit= {
    //   fieldNum:'priceSqFt',
    //   name:`Price per ${this.measureUnits[0].area}`,
    //   isEnable:false
    // }
    // this.dynamicColumns.push(priceUnit);
      this.eventsSubscription = this.events.subscribe((response: any) => {
        this.page = 1;
        this.pageSize = 20;
        if (response) {
            this.filterForm.project_id = response.project_id;
            // this.filterForm.builder_id = response.builder_id;
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
    let projectFilterData: any = localStorage.getItem('financeTabData');
    if (projectFilterData) {
        projectFilterData = JSON.parse(projectFilterData);
        if (projectFilterData.project_id) {
            this.filterForm.project_id = projectFilterData.project_id;
            this.getDealPricingStoredData();
        }
        else{
            this.getProjectList();
        }
        // if (projectFilterData.builder_id) {
        //     this.filterForm.builder_id = projectFilterData.builder_id;
        // }
    }
    else{
        this.getProjectList();    
    }
    
  }


  getDealPricingStoredData(){
    let filterData: any = localStorage.getItem('fiannaceDealriceFilterData');
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
    this.getProjecDetails();
    this.getDealPricing();
  }

  getProjectList() {
    this.spinnerService.show();
    let url = `finance/projects`;
    this.webService.get(url).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.status == 1) {
            let projectList = response.results;
            this.filterForm.project_id= projectList[0] ? projectList[0]._id :'';
            let data = {
                project_id: this.filterForm.project_id,
            }
            localStorage.setItem('financeTabData', JSON.stringify(data));
            this.projectChanged.emit(data);
            this.getDealPricingStoredData();
        }
    }, (error) => {
        console.log('error', error);
    });
  }

  getProjecDetails() {
    if(this.filterForm.project_id){
        this.spinnerService.show();
        let url = `finance/projects?_id=${this.filterForm.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.initialColsSettings();
            if (response.status == 1) {
                this.projectDetails = response.result;
                if(this.projectDetails.deal_pricing_display_settings){
                    this.dynamicColumns.forEach(element => {
                        if(this.projectDetails.deal_pricing_display_settings[element.fieldNum]){
                            element.isEnable=true;
                        }
                        else{
                            element.isEnable=false;
                        }
                      });
                  let records= this.dynamicColumns.filter((ele)=>ele.isEnable==true);
                  this.colSpanVal= this.colSpanVal+records.length;
                }
              
            }

        }, (error) => {
            console.log('error', error);
        });
    }
    else{
        this.initialColsSettings();
    }
  }

  onProjectChange() {
    this.getProjecDetails();
    this.getDealPricing();
  }

  getDealPricing() {
    this.spinnerService.show();
    this.saveFilter();
    let url = `finance/deals?page=${this.page}&pageSize=${this.pageSize}`
    if (this.sortedtby) {
      url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
    }
    if (this.filterForm.project_id) {
      url = url + `&project_id=${this.filterForm.project_id}`;
    }
    // if (this.filterForm.builder_id) {
    //   url = url + `&builder_id=${this.filterForm.builder_id}`;
    // }
    if (this.filterForm.searchText && this.filterForm.searchText.trim())
    url = url + `&searchText=${this.filterForm.searchText.trim()}`;

    this.webService.get(url).subscribe((response: any) => {
        this.spinnerService.hide();
        this.dealPricingList=[];
        if (response.is_valid_session) {
            if (response.status == 1) {
                this.dealPricingList = response.results;
                this.dealPricingList.forEach((deal)=>{
                    if(deal.finance){
                        deal.finance['price']= deal.finance.hasOwnProperty('base_price') ? deal.finance['base_price'] :'';
                        deal.finance['bicycle_price']=  deal.finance.hasOwnProperty('bicycle_price') ? deal.finance['bicycle_price'] :'';
                        deal.finance['contract_price']=  deal.finance.hasOwnProperty('contract_price') ? deal.finance['contract_price'] :'';
                        deal.finance['floor_premium']=  deal.finance.hasOwnProperty('floor_premium') ? deal.finance['floor_premium']  :'';
                        deal.finance['locker_price']=  deal.finance.hasOwnProperty('locker_price') ? deal.finance['locker_price']  :'';
                        deal.finance['net_price']=  deal.finance.hasOwnProperty('net_price') ? deal.finance['net_price']  :'';
                        deal.finance['parking_price']=  deal.finance.hasOwnProperty('parking_price') ? deal.finance['parking_price']  :'';
                        deal.finance['priceSqFt']=  deal.finance.hasOwnProperty('price_sqft') ? deal.finance['price_sqft']  :'';
                        deal.finance['sales_price']=  deal.finance.hasOwnProperty('sales_price') ? deal.finance['sales_price']  :'';
                        deal.finance['tax']=  deal.finance.hasOwnProperty('tax') ? deal.finance['tax']  :'';
                        deal.finance['total_discount']=  deal.finance.hasOwnProperty('total_discount') ? deal.finance['total_discount']  :'';
                        deal.finance['unit_premium']=  deal.finance.hasOwnProperty('unit_premium') ? deal.finance['unit_premium']  :'';
                        deal.finance['total_penalty']=deal.finance.hasOwnProperty('total_penalty') ? deal.finance['total_penalty']  : '';
                        deal.finance['nsf_count']=deal.finance.hasOwnProperty('nsf_count') ? deal.finance['nsf_count']  : '';
                        deal.finance['nsf_fee_paid']=deal.finance.hasOwnProperty('nsf_fee_paid') ? deal.finance['nsf_fee_paid']  : '';
                    }
                    else{
                        deal.finance={};
                        deal.finance['price']= '';
                        deal.finance['contract_price']=  '';
                        deal.finance['floor_premium']=  '';
                        deal.finance['net_price']=  '';
                        deal.finance['bicycle_price']= '';
                        deal.finance['locker_price']= '';
                        deal.finance['parking_price']= '';
                        deal.finance['priceSqFt']=  '';
                        deal.finance['sales_price']= '';
                        deal.finance['tax']=  '';
                        deal.finance['total_discount']= '';
                        deal.finance['unit_premium']= '';
                        deal.finance['total_penalty']= '';
                        deal.finance['nsf_count']= '';
                        deal.finance['nsf_fee_paid']= '';
                        
                    }

                  
                })
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
        } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
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
        searchText: this.filterForm.searchText,
        // model_id: this.filterForm.model_id,
        // collection: this.filterForm.collection,
        // type: this.filterForm.type,
        // beds: this.filterForm.beds,
        // baths: this.filterForm.baths,
        // media: this.filterForm.media,
        // flex: this.filterForm.flex,
        // floor_legal: this.filterForm.floor_legal,
    }
    localStorage.setItem('fiannaceDealriceFilterData', JSON.stringify(data));
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
    this.getDealPricing();
  }

  doPaginationWise(page) {
      this.page = page;
      this.getDealPricing();
  }

  setPageSize() {
      this.page = 1;
      this.getDealPricing();
  }

  ///// SEARCH AND FILTERS //////
  doSearch() {
    if (this.filterForm.searchText && this.filterForm.searchText.length > 0) {
        this.isClear = true;
    } else {
        this.isClear = false;
    }
    this.page = 1;
    this.getDealPricing();
  
  }

  clearSearch() {
      this.page = 1;
      this.isClear = false;
      this.filterForm.searchText = '';
      this.getDealPricing();
  }

  clearFilter() {
      this.page = 1;
      this.pageSize = 20;
      this.filterForm.searchText = '';
      this.isClear = false;
      this.getDealPricing();
  }

 
//// ENABLE COLS /////  
  openEnableCols(template: TemplateRef<any>){
    this.formDetails.cols=[];
    this.dynamicColumns.forEach(element => {
        this.formDetails.cols.push(Object.assign({},element));
    });
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
  }

  onSettingsSave(){
    let data:any={};
    data.deal_pricing_display_settings= { };
    this.formDetails.cols.forEach(element => {
        if(element){
            data.deal_pricing_display_settings[element.fieldNum]=element.isEnable;
        }
    });
    // console.log('data',data);
    if(this.filterForm.project_id){
        let url = `finance/projects?_id=${this.filterForm.project_id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getDealPricing();
                    this.getProjecDetails();
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    else{
        this.toastr.warning(`Please select project`, 'Warning');
    }

  }

  initialColsSettings(){
    this.dynamicColumns.forEach(element => {
        element.isEnable=false;
    });
  }

  getDealPayments(deal) {
    this.spinnerService.show();
    let url = `sales/deals-payments?deal_id=${deal._id}`;
    this.webService.get(url).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.is_valid_session) {
            if (response.status == 1) {
                deal.records = response.results ? response.results : [];
                deal.total_amount = 0;
                deal.nsf_fee_paid = 0;
                deal.total_interest = 0;
                deal.total_penalty = 0;
                deal.records.forEach(element => {
                    if (element) {
                        deal.total_amount = element.payment_amount + deal.total_amount;
                        deal.nsf_fee_paid = deal.nsf_fee_paid + (element.nsf_fee ? element.nsf_fee : 0);
                            deal.total_interest = deal.total_interest + (element.interest ? element.interest : 0);
                            deal.total_penalty = deal.total_penalty + (element.penalty ? element.penalty : 0);
                    }
                });
                let nsfRecords = deal.records.filter(element => element.nsf == true);
                deal.nsf_count = nsfRecords.length;
            }
        } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
        }
    }, (error) => {
      this.spinnerService.hide();
        console.log('error', error);
    });
  }
  

}