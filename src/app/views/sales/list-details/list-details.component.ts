import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpClient } from "@angular/common/http";
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
    selector: 'app-list-details',
    templateUrl: './list-details.component.html',
    styleUrls: ['./list-details.component.css']
})
export class ListDetailsComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    selectedAll: boolean = false;
    isProcessBtnShow: boolean = false;
    separateDialCode = true;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
    contactList: any = [];
    territories: any = [];
    paginationObj: any = {};
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    isClear: boolean = false;
    modalRef: BsModalRef;
    formDetails: any = {};
    listDetails: any = {};
    filterForm: any = {
        region: '',
        country: '',
        state: '',
        searchText: ''
    };
    regions: any = [];
    countries: any = [];
    states: any = [];
    lists: any = [];
    listId = '';
    phoneForm = new FormGroup({
        phone: new FormControl(undefined, [Validators.required])
    });
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private activatedRoute: ActivatedRoute,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService
    ) {
        this.listId = this.activatedRoute.snapshot.paramMap.get('Id');
    }
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
    }
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
                }
                else {
                    this.getRegions();
                    this.getListDetails();
                    this.getSavedFilterdata();
                    this.getcontactList();
                }
            } else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getListDetails() {
        let url = `sales/lists?id=${this.listId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.listDetails = response.result;
            } else {
                this.listDetails = {};
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('umcContactListFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.region) {
                this.filterForm.region = filterData.region;
                setTimeout(() => {
                    this.getCountries(filterData.region);
                }, 1000);
            } else {
                this.getCountries('');
            }
            if (filterData.country) {
                this.filterForm.country = filterData.country;
                setTimeout(() => {
                    this.getStates(filterData.country);
                }, 1500);
            } else {
                this.getStates('');
            }
            if (filterData.state) {
                this.filterForm.state = filterData.state;
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
        this.getcontactList();
    }
    getcontactList() {
        this.isProcessBtnShow = false;
        this.selectedAll = false;
        this.spinnerService.show();
        this.saveFilter();
        let url = `sales/contacts?page=${this.page}&pageSize=${this.pageSize}&list=${this.listId}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.region)
            url = url + `&region=${this.filterForm.region}`;
        if (this.filterForm.country)
            url = url + `&country=${this.filterForm.country}`;
        if (this.filterForm.state)
            url = url + `&state=${this.filterForm.state}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.contactList=[];
            if (response.success) {
                this.contactList = response.results;
                if(this.page >1 && response.results.length==0 && !response.pagination){
                    this.page = this.page > 1? this.page-1 :1;
                    this.getcontactList()  
                } 
                this.contactList.forEach(item => {
                    if (item.phones && item.phones.length > 0) {
                        let keepGoing = true;
                        item.phones.forEach(phone => {
                            if (keepGoing) {
                                if (!phone.is_inactive) {
                                    item.phones = {
                                        formatted: phone.formatted
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.phones = {
                            formatted: ''
                        }
                    }
                    if (item.emails && item.emails.length > 0) {
                        let keepGoing = true;
                        item.emails.forEach(email => {
                            if (keepGoing) {
                                if (!email.is_inactive) {
                                    item.emails = {
                                        email: email.email
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.emails = {
                            email: ''
                        }
                    }
                });
                if (response.pagination)
                    this.paginationObj = response.pagination;
                else
                    this.paginationObj = {
                        total: 0
                    };
            } else {
                this.contactList = [];
                this.paginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    doPaginationWise(page) {
        this.page = page;
        this.getcontactList();
    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getcontactList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.getcontactList();
    }
    setPageSize() {
        this.page = 1;
        this.getcontactList();
    }
    goToDetails(id) {
        this.router.navigate([`sales//contact/${id}`]);
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            region: this.filterForm.region,
            country: this.filterForm.country,
            state: this.filterForm.state
        }
        localStorage.setItem('umcContactListFilterData', JSON.stringify(data));
    }
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            region: '',
            country: '',
            state: '',
            searchText: ''
        };
        this.isClear = false;
        this.getcontactList();
    }
    // for regions
    getRegions() {
        let url = `sales/geography?type=region`;
        this.webService.get(url).subscribe((response: any) => {
            console.log(response);
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.regions = response.results;
            } else {
                this.regions = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    getCountries(region) {
        // if (region != '') {
        const foundId = this.regions.find(element => element.name == region);
        let url = `sales/geography?type=country`;
        if (foundId)
            url = url + `&parent=${foundId._id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.countries = response.results;
            } else {
                this.countries = [];
            }
        }, (error) => {
            console.log('error', error);
        });
        // } else {
        //   this.countries = [];
        // }
    }
    getStates(country) {
        const foundId = this.countries.find(element => element.name == country);
        let url = `sales/geography?type=state`;
        if (foundId)
            url = url + `&parent=${foundId._id}`;
        this.webService.get(url).subscribe((response: any) => {
            console.log(response);
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.states = response.results;
            } else {
                this.states = [];
            }
        }, (error) => {
            console.log('error', error);
        });

    }
    // for add to list
    selectAll() {
        for (var i = 0; i < this.contactList.length; i++) {
            this.contactList[i].selected = this.selectedAll;
        }
        this.showProcessBtn();
    }
    showProcessBtn() {
        var selected = 0;
        for (var i = 0; i < this.contactList.length; i++) {
            if (this.contactList[i].selected == true) {
                selected++;
            }
        }
        if (selected > 0) {
            this.isProcessBtnShow = true;
        } else {
            this.isProcessBtnShow = false;
        }
    }
    getLists() {
        let url = `sales/lists`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.lists = response.results && response.results.rows ? response.results.rows : [];
            } else {
                this.lists = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openEditList(template: TemplateRef<any>) {
        this.formDetails = { ...this.listDetails };
        this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    }
    updateLists() {
        if (this.formDetails.name == '') {
            this.toastr.warning('Please enter name', 'Warning');
        } else {
            let url = `sales/lists`;
            this.webService.post(url, this.formDetails).subscribe((response: any) => {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getListDetails();
                        this.modalRef.hide();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    removeFromList() {
        let contactIds = [];
        for (var i = 0; i < this.contactList.length; i++) {
            if (this.contactList[i].selected == true) {
                contactIds.push(this.contactList[i]._id);
            }
        }
        let data: any = {
            contactIds: contactIds,
            list: this.listId
        };
        let url = `sales/remove-from-list`;
        this.webService.post(url, data).subscribe((response: any) => {
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getcontactList();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    goBack() {
        this.router.navigate(['sales']);
    }
}

