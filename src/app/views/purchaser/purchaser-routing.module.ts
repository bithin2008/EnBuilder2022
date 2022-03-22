import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PurchaserComponent } from './purchaser.component';
import { CollectionsComponent } from './collections/collections.component';
import { PagesComponent } from './pages/pages.component';
import { PageDetailsComponent } from './page-details/page-details.component';
import { UnitDealsDetailsComponent } from './unit-deals-details/unit-deals-details.component';
const routes: Routes = [
    {
        path: '',
        component: PurchaserComponent
    },
    {
        path: 'book-details/:bookId',
        component: CollectionsComponent
    },
    {
        path: 'collection-details/:bookId/:collectionId',
        component: PagesComponent
    },
    {
        path: 'page-details/:bookId/:collectionId/:pageId',
        component: PageDetailsComponent
    },
    {
        path: 'unit-details/:unitId',
        component: UnitDealsDetailsComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PurchaserRoutingModule { }
