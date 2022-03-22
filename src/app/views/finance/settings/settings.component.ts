import { Component, OnInit, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-finance-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    formDetails: any = {
    }
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.getSettings();
    }

    getSettings() {
        let url = `finance/crm-settings?type=TAX_PERCENTAGE`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                //    this.formDetails.tax='';
                this.formDetails = (response.results && response.results.length > 0) ? response.results[0] : {};
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onSave() {
        let data = {
            percentage: this.formDetails.percentage,
            _id: this.formDetails._id
        }
        let url = `finance/crm-settings?type=TAX_PERCENTAGE`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getSettings();
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
