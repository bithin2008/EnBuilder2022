import { Component, OnInit, Input } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Subscription, Observable } from 'rxjs';


@Component({
    selector: 'app-inventory-dashboard',
    templateUrl: './inventory-dashboard.component.html',
    styleUrls: ['./inventory-dashboard.component.css']
})
export class InventoryDashboardComponent implements OnInit {
    dataList: any = [];
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    filterForm: any = {
        project_id: ''
    }

    constructor(
        private webService: WebService,
        private spinnerService: Ng4LoadingSpinnerService
    ) { }

    
    ngOnInit(): void {
        this.eventsSubscription = this.events.subscribe((response: any) => {
            if (response) {
                this.filterForm.project_id = response._id;
            }
            else {
                this.filterForm.project_id = '';
            }
            this.projectFilterChange();
        });
        this.getSavedFilterdata();

    }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('inventoriesProjectData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData._id) {
                this.filterForm.project_id = projectFilterData._id;
            }
        }
        this.getDashboardData();
    }

    getDashboardData() {
        this.spinnerService.show();
        let url = `inventories/dashboard-data`;
        if (this.filterForm.project_id) {
            url = url + `?project_id=${this.filterForm.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.dataList = response.results;
            }

        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    projectFilterChange() {
        this.getDashboardData();
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

}

