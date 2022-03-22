import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UnitListComponent } from './unit-list/unit-list.component';
import { ParkingComponent } from './parking/parking.component';
import { ParkingFloorComponent, SpaceInfoComponent } from './parking-floor/parking-floor.component';
import { ModelsComponent } from './models/models.component';
import { ModelsModule } from './models/models.module';
import { FileSaverModule } from 'ngx-filesaver';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InventoriesComponent } from './inventories.component';
import { InventoriesRoutingModule } from './inventories-routing.module';
import { InventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { LockerComponent } from './locker/locker.component';
import { LockerAreaComponent, LockerUnitInfoComponent } from './locker-area/locker-area.component';
import { BicycleComponent } from './bicycle/bicycle.component';
import { BicycleFloorComponent, BicycleUnitInfoComponent } from './bicycle-floor/bicycle-floor.component';
import { LotTypeComponent } from './lot-type/lot-type.component';
import { UnitDetailsComponent } from './unit-details/unit-details.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
// import { ContactModalComponent } from '../sales/contact-modal/contact-modal.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
    declarations: [InventoriesComponent, SpaceInfoComponent, BicycleUnitInfoComponent, LockerUnitInfoComponent, LockerComponent, InventoryDashboardComponent, UnitListComponent, ParkingComponent, ParkingFloorComponent, LockerAreaComponent, BicycleComponent, BicycleFloorComponent, LotTypeComponent, UnitDetailsComponent],
    imports: [
        CommonModule,
        InventoriesRoutingModule,
        NgMultiSelectDropDownModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        MultiSelectModule,
        NgbModule,
        ModalModule.forRoot(),
        TabsModule,
        ModalModule,
        ModelsModule,
        FileSaverModule,
        PdfViewerModule,
        NgxIntlTelInputModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        BsDatepickerModule.forRoot(),
    ],
    entryComponents: [SpaceInfoComponent, BicycleUnitInfoComponent, LockerUnitInfoComponent]
})
export class InventoriesModule { }
