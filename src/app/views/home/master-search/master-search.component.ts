import { Component, OnInit, Renderer2 } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-master-search',
    templateUrl: './master-search.component.html',
    styleUrls: ['./master-search.component.css']
})
export class MasterSearchComponent implements OnInit {
    filterForm: any = {
        searchText: ''
    }
    formDetails: any = {
        filter_type: 'All Information'
    };
    searchedData: any = [];
    isClear: boolean = false;
    paginationObj: any = {};
    page: number = 1;
    pageSize: number = 20;
    typeList: any = [
        { type: 'projects', name: "Project", isSelected: false },
        { type: 'models', name: "Models", isSelected: false },
        { type: 'units', name: "Units", isSelected: false },
        { type: 'parking', name: "Parking", isSelected: false },
        { type: 'lockers', name: "Lockers", isSelected: false },
        { type: 'bicycle parking', name: "Bicycle Parking", isSelected: false },
        { type: 'registrants', name: "Registrants", isSelected: false },
        { type: 'worksheets', name: "Worksheets", isSelected: false },
        { type: 'deals', name: "Deals", isSelected: false },
        { type: 'color collections', name: "Color Collections", isSelected: false },
        { type: 'packages', name: "Packages", isSelected: false },
        { type: 'options', name: "Options", isSelected: false },

    ];
    constructor(private webService: WebService,
        private router: Router,
        private toastr: ToastrService,
        private renderer: Renderer2,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }

    ngOnInit(): void {
        this.getSearchedRecords();
        let element: HTMLElement = this.renderer.selectRootElement(`#masterSearch`);
        element.focus()

    }


    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getSearchedRecords();
    }

    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.getSearchedRecords();
    }

    clearFilter() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.getSearchedRecords();

    }

    setPageSize() {
        this.page = 1;
        this.getSearchedRecords();
    }

    onFilterTypeChange() {
        this.page = 1;
        if (this.formDetails.filter_type == 'All Information') {
            this.typeList.forEach(element => {
                element.isSelected = false;
            });
            this.getSearchedRecords();
        }
        else {
            this.typeList.forEach(element => {
                element.isSelected = false;
            });
        }

    }

    doPaginationWise(page) {
        this.page = page;
        this.getSearchedRecords();
    }

    getSearchedRecords() {
        if (this.filterForm.searchText) {
            let url = `home/master-search?page=${this.page}&pageSize=${this.pageSize}`;
            // if (this.filterForm.searchText) {
            url = url + `&searchText=${this.filterForm.searchText}`;
            // }
            if (this.formDetails.filter_type == 'Selected Information' && this.formDetails.types && this.formDetails.types.length > 0) {
                let types = this.formDetails.types.join();
                // url = url.indexOf('searchText') == -1 ? url + `?type=${types}` : url + `&type=${types}`;
                url = url + `&type=${types}`;
            }
            else {
                // url = url.indexOf('searchText') == -1 ? url + `?type=${this.formDetails.filter_type}` : url + `&type=${this.formDetails.filter_type}`;
            }
            this.spinnerService.show();
            // console.log(url);
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                this.searchedData = [];
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.searchedData = (response.results && response.results.length > 0) ? response.results : [];
                        if (response.pagination)
                            this.paginationObj = response.pagination;
                        else
                            this.paginationObj = {
                                total: 0
                            };

                    } else {
                        this.searchedData = [];
                        this.paginationObj = {
                            total: 0
                        };
                    }
                } else {
                    this.spinnerService.hide();
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'home' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {
            this.searchedData = [];
            this.paginationObj = {
                total: 0
            };
        }
    }

    onTypeChange(item, event) {
        this.page = 1;
        let types = this.typeList.filter(element => element.isSelected);
        this.formDetails.types = types.map((ele) => ele.type)
        this.getSearchedRecords();
    }

    navigateToPage(item) {
        let url = ``;
        if (item.type == 'projects') {
            url = `#/projects/${item._id}`;
        }
        else if (item.type == 'models') {
            url = `#/inventories/model/${item._id}`;
        }
        else if (item.type == 'units') {
            url = `#/inventories/unit/${item._id}`;
        }
        else if (item.type == 'parking') {
            url = `#/inventories/parking-floor/${item._id}`;
        }
        else if (item.type == 'lockers') {
            url = `#/inventories/locker-floor/${item._id}`;
        }
        else if (item.type == 'bicycle parking') {
            url = `#/inventories/bicycle-floor/${item._id}`;
        }
        else if (item.type == 'registrants') {
            url = `#/sales/registrants/${item._id}`;
        }
        else if (item.type == 'worksheets') {
            url = `#/sales/worksheets/${item._id}`;
        }
        else if (item.type == 'deals') {
            url = `#/sales/deals/${item._id}`;
        }
        else if (item.type == 'color collections') {
            url = `#/package-center/color-collections/${item._id}`;
        }
        else if (item.type == 'packages') {
            url = `#/package-center/packages/${item._id}`;
        }
        else if (item.type == 'options') {
            url = `#/package-center/options/${item._id}`;
        }
        else {
            url = `#/`;
        }
        window.open(url, '_blank');
    }


}
