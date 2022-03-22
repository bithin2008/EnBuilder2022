import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WebService } from './services/web.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    // tslint:disable-next-line
    selector: 'body',
    template: '<ng4-loading-spinner [timeout]="100000"> </ng4-loading-spinner><router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
    constructor(private router: Router, private webService: WebService, private toastr: ToastrService) { }

    ngOnInit() {
        let measermentUnits = localStorage.getItem('measurementUnit');
        if (!measermentUnits) {
            this.getMeasurementUnit();
        }
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
        });
        window.addEventListener('storage', (event) => {
            if (event.key == 'token') {
                this.router.navigate(['/home']);
            }
            if (event.storageArea == localStorage) {
                let token = localStorage.getItem('token');
                if (token == undefined) {
                    window.location.reload();
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    getMeasurementUnit() {
        let url = `sales/crm-settings?type=MEASUREMENT-UNITS`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.status == 1) {
                    if (response.results) {
                        localStorage.setItem('measurementUnit', JSON.stringify(response.results))
                    }

                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                // this.router.navigate(['/login'], { queryParams: { return_url: 'home' } });
            }
        }, (error) => {
            console.log('error', error);
        });


    }
}
