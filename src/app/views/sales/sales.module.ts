import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';

import { SalesComponent } from './sales.component'
import { WorksheetsComponent } from './worksheets/worksheets.component';
import { WorksheetsDetailsComponent } from './worksheets-details/worksheets-details.component';
import { ListsComponent } from './lists/lists.component';
import { ListDetailsComponent } from './list-details/list-details.component';
import { ContactsComponent } from './contacts/contacts.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { DealListComponent } from './deal-list/deal-list.component';
import { RegistrantsComponent } from './registrants/registrants.component';
import { SalesRoutingModule } from './sales-routing.module';
import { InventoryModalComponent } from './inventory-modal/inventory-modal.component';
import { DealDetailsComponent } from './deal-details/deal-details.component';
// import { ContactModalComponent } from './contact-modal/contact-modal.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RegistrantsDetailsComponent } from './registrants-details/registrants-details.component';
import { CreateDealModalComponent } from './create-deal-modal/create-deal-modal.component';
import { SalesSettingsComponent } from './settings/settings.component';

@NgModule({
    declarations: [
        SalesComponent,
        ContactsComponent,
        WorksheetsComponent,
        WorksheetsDetailsComponent,
        DealListComponent,
        ContactDetailsComponent,
        RegistrantsComponent,
        ListDetailsComponent,
        ListsComponent,
        InventoryModalComponent,
        DealDetailsComponent,
        RegistrantsDetailsComponent,
        CreateDealModalComponent,
        SalesSettingsComponent

    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        ModalModule.forRoot(),
        AccordionModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        TabsModule,
        ModalModule,
        SalesRoutingModule,
        NgxIntlTelInputModule,
        AutoCompleteModule,
        RadioButtonModule,
        BsDatepickerModule.forRoot(),
        PdfViewerModule

    ],
    entryComponents: [InventoryModalComponent, CreateDealModalComponent]
})
export class SalesModule { }
