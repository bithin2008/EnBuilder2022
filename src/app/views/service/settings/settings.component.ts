import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject, Observable } from 'rxjs';
import { WebService } from '../../../services/web.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    defaultActiveTab: any = 'usersTab';
    collectionId: string;
    collectionDetailsObj: any;
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    eventsSubject: Subject<void> = new Subject<void>();
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();
    projectList:any=[];
    constructor(
        private webService: WebService,
        private toastr: ToastrService,
        private router: Router,
        private spinnerService: Ng4LoadingSpinnerService
    ) { }


    ngOnInit(): void {
        if (localStorage.getItem('serviceSettingActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('serviceSettingActiveTab');
        }
        this.eventsSubscription = this.events.subscribe((response: any) => {
            if (response) {
                this.eventsSubject.next(response);
            }
            else {
                this.eventsSubject.next(undefined);
            }
        });
        this.getProjectList();
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    doTabFunctions(event) {
        if (event.nextId == 'usersTab') {
            localStorage.setItem('serviceSettingActiveTab', 'usersTab');
        }
        if (event.nextId == 'rolesTab') {
            localStorage.setItem('serviceSettingActiveTab', 'rolesTab');
        }
        if (event.nextId == 'locationTab') {
            localStorage.setItem('serviceSettingActiveTab', 'locationTab');
        }
        if (event.nextId == 'tagsTab') {
            localStorage.setItem('serviceSettingActiveTab', 'tagsTab');
        }
        if (event.nextId == 'priorityTab') {
            localStorage.setItem('serviceSettingActiveTab', 'priorityTab');
        }
        if (event.nextId == 'checklistTab') {
            localStorage.setItem('serviceSettingActiveTab', 'checklistTab');
        }
        if (event.nextId == 'typeDeficiencyTab') {
            localStorage.setItem('serviceSettingActiveTab', 'typeDeficiencyTab');
        }
        if (event.nextId == 'inspectionTypeTab') {
            localStorage.setItem('serviceSettingActiveTab', 'inspectionTypeTab');
        }
        


    }

    onProjectChanged(data) {
        if (data) {
            this.projectChanged.emit(data);
        }
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `service/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
            }
        }, (error) => {
            console.log('error', error);
        });
    }
}
