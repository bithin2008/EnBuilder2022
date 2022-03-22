import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PackageCenterComponent } from './package-center.component';
import { ColorCollectionsDetailsComponent } from './color-collections-details/color-collections-details.component';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { OptionsDetailsComponent } from './options-details/options-details.component';


const routes: Routes = [
    {
        path: '',
        component: PackageCenterComponent,
        data: {
            title: 'Dashboard'
        }
    },
    {
        path: 'color-collections/:collectionId',
        component: ColorCollectionsDetailsComponent,
        data: {
            title: 'Color Collections'
        }
    },
    {
        path: 'packages/:packageId',
        component: PackageDetailsComponent,
        data: {
            title: 'Package'
        }
    },
    {
        path: 'options/:optionId',
        component: OptionsDetailsComponent,
        data: {
            title: 'Option'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PackageCenterRoutingModule { }
