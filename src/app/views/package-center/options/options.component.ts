import { Component, OnInit, Input } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    defaultActiveTab: any = 'categoriesTab';
    collectionId: string;
    collectionDetailsObj: any;
    eventsSubject: Subject<void> = new Subject<void>();

    constructor() { }

    ngOnInit(): void {
        if (localStorage.getItem('optionsActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('optionsActiveTab');
        }
        this.eventsSubscription = this.events.subscribe((response: any) => {
            if (response) {
                this.eventsSubject.next(response);
            }
            else {
                this.eventsSubject.next(undefined);
            }
        });
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
    doTabFunctions(event) {
        if (event.nextId == 'categoriesTab') {
            localStorage.setItem('optionsActiveTab', 'categoriesTab');
        }
        if (event.nextId == 'optionsTab') {
            localStorage.setItem('optionsActiveTab', 'optionsTab');
        }
    }

}
