import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';

import { ServiceRoutingModule } from './service-routing.module';
import { ServiceComponent } from './service.component';
import { OccupancyDatesComponent } from './occupancy-dates/occupancy-dates.component';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DeficiencyComponent } from './deficiency/deficiency.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './settings/users/users.component';
import { ChecklistComponent } from './settings/checklist/checklist.component';
import { ChecklistInspectionComponent } from './checklist-inspection/checklist-inspection.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PriorityComponent } from './settings/priority/priority.component';
import { LocationComponent } from './settings/location/location.component';
import { TagComponent } from './settings/tag/tag.component';
import { RolesComponent } from './settings/roles/roles.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TypeDeficiencyComponent } from './settings/type-deficiency/type-deficiency.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ServiceDashboardComponent } from './service-dashboard/service-dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { ChecklistsComponent } from './checklists/checklists.component';
import { ChecklistsDetailsComponent } from './checklists-details/checklists-details.component';
import { InspcetionTypeComponent } from './settings/inspcetion-type/inspcetion-type.component'

@NgModule({
    declarations: [ServiceComponent, OccupancyDatesComponent, DeficiencyComponent, SettingsComponent, UsersComponent, ChecklistComponent, ChecklistInspectionComponent, PriorityComponent, LocationComponent, TagComponent, RolesComponent, TypeDeficiencyComponent, ServiceDashboardComponent, ChecklistsComponent, ChecklistsDetailsComponent, InspcetionTypeComponent],
    imports: [
        CommonModule,
        ServiceRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        TabsModule,
        ModalModule.forRoot(),
        ModalModule,
        ChartsModule,
        AutoCompleteModule,
        NgMultiSelectDropDownModule.forRoot(),
        MultiSelectModule,
        BsDatepickerModule.forRoot(),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        NgxFileDropModule,
        TimepickerModule.forRoot()
    ]
})
export class ServiceModule { }
