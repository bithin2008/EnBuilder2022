import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PackageCenterRoutingModule } from './package-center-routing.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PackageCenterComponent } from './package-center.component';
import { ColorCollectionsListComponent } from './color-collections-list/color-collections-list.component';
import { ColorCollectionsDetailsComponent } from './color-collections-details/color-collections-details.component';
import { GeneralComponent } from './color-collections-details/general/general.component';
import { ItemsComponent } from './color-collections-details/items/items.component';
import { ColorCollectionPackagesComponent } from './color-collections-details/packages/packages.component';
import { ColorOptionsComponent } from './color-collections-details/options/options.component';
import { ModelsComponent } from './color-collections-details/models/models.component';
import { UnitsComponent } from './color-collections-details/units/units.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { PackageListComponent } from './package-list/package-list.component';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { PackageGeneralComponent } from './package-details/package-general/package-general.component';
import { PackageCollectionsComponent } from './package-details/package-collections/package-collections.component';
import { PackageModelsComponent } from './package-details/package-models/package-models.component';
import { PackageUnitsComponent } from './package-details/package-units/package-units.component';
import { CategoriesComponent } from './options/categories/categories.component';
import { OptionsListComponent } from './options/options-list/options-list.component';
import { OptionsDetailsComponent } from './options-details/options-details.component';
import { OptionsComponent } from './options/options.component';
import { OptionGeneralComponent } from './options-details/option-general/option-general.component';
import { PackageCenterSettingsComponent } from './package-center-settings/package-center-settings.component';
import { PackagePackagesComponent } from './package-details/packages/packages.component';
import { OptionsModelComponent } from './options-details/options-model/options-model.component';
import { OptionsUnitComponent } from './options-details/options-unit/options-unit.component';
import { IncludedOptionsComponent } from './package-details/included-options/included-options.component';
import { OptionsTypeComponent } from './options-details/options-type/options-type.component';
import { PackageTypeComponent } from './options-details/package-type/package-type.component';
import { CollectionTypeComponent } from './options-details/collection-type/collection-type.component';
import { PackageLocationsComponent } from './package-locations/package-locations.component';


@NgModule({
    declarations: [PackageCenterComponent,
        ColorCollectionsListComponent,
        ColorCollectionsDetailsComponent,
        GeneralComponent,
        ItemsComponent,
        PackagePackagesComponent,
        ColorCollectionPackagesComponent,
        ColorOptionsComponent,
        OptionsComponent,
        ModelsComponent,
        UnitsComponent,
        PackageListComponent,
        PackageDetailsComponent,
        PackageGeneralComponent,
        PackageCollectionsComponent,
        PackageModelsComponent,
        PackageUnitsComponent,
        CategoriesComponent,
        OptionsListComponent,
        OptionsDetailsComponent,
        OptionGeneralComponent,
        PackageCenterSettingsComponent,
        OptionsModelComponent,
        OptionsUnitComponent,
        IncludedOptionsComponent,
        OptionsTypeComponent,
        PackageTypeComponent,
        CollectionTypeComponent,
        PackageLocationsComponent],
    imports: [
        CommonModule,
        PackageCenterRoutingModule,
        NgMultiSelectDropDownModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MultiSelectModule,
        NgbModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
    ]
})
export class PackageCenterModule { }
