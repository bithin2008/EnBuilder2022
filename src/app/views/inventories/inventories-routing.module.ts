import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModelDetailsComponent } from './model-details/model-details.component';
import { UnitListComponent } from './unit-list/unit-list.component';
import { ParkingFloorComponent } from './parking-floor/parking-floor.component';
import { InventoriesComponent } from './inventories.component';
import { LockerAreaComponent } from './locker-area/locker-area.component';
import { BicycleFloorComponent } from './bicycle-floor/bicycle-floor.component';
import { UnitDetailsComponent } from './unit-details/unit-details.component';



const routes: Routes = [
    {
        path: '',
        component: InventoriesComponent,
        data: {
            title: 'Dashboard'
        }
    },
    {
        path: 'model/:modelId',
        component: ModelDetailsComponent,
        data: {
            title: 'Builder Details'
        }
    },
    {
        path: 'unit',
        component: UnitListComponent,
        data: {
            title: 'Unit List'
        }
    },
    {
        path: 'unit/:unitId',
        component: UnitDetailsComponent,
        data: {
            title: 'Unit Pricing'
        }
    },
    {
        path: 'parking-floor/:projectId/:floorId',
        component: ParkingFloorComponent,
        data: {
            title: 'Parking Floor'
        }
    },
    {
        path: 'locker-floor/:projectId/:floorId',
        component: LockerAreaComponent,
        data: {
            title: 'Locker Floor'
        }
    },
    {
        path: 'bicycle-floor/:projectId/:floorId',
        component: BicycleFloorComponent,
        data: {
            title: 'Bicycle Floor'
        }
    }

];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InventoriesRoutingModule { }
