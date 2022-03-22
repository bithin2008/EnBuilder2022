import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FinanceComponent } from './finance.component';
import { UnitPricingComponent } from './unit-pricing/unit-pricing.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { IncentivesComponent } from './incentives/incentives.component';
import { DepositStructureComponent } from './deposit-structure/deposit-structure.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { DepositComponent } from './deposit/deposit.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SettingsComponent } from './settings/settings.component';
import { PaymentsComponent } from './payments/payments.component';
import { DealPricingComponent } from './deal-pricing/deal-pricing.component';


@NgModule({
    declarations: [FinanceComponent, UnitPricingComponent, DepositStructureComponent, IncentivesComponent, DepositComponent, SettingsComponent, PaymentsComponent, DealPricingComponent],
    imports: [
        CommonModule,
        FinanceRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        BsDatepickerModule.forRoot(),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot()

    ]
})
export class FinanceModule { }
