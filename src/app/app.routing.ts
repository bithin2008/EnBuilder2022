import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Import Containers
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: '404',
        component: P404Component,
        data: {
            title: 'Page 404'
        }
    },
    {
        path: '500',
        component: P500Component,
        data: {
            title: 'Page 500'
        }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: {
            title: 'Login Page'
        }
    },
    {
        path: '',
        component: DefaultLayoutComponent,
        data: {
            title: 'Home'
        },
        children: [
            {
                path: 'home',
                loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule)
            },
            {
                path: 'builders',
                loadChildren: () => import('./views/builders/builders.module').then(m => m.BuildersModule)
            },
            {
                path: 'projects',
                loadChildren: () => import('./views/projects/projects.module').then(m => m.ProjectsModule)
            },
            {
                path: 'inventories',
                loadChildren: () => import('./views/inventories/inventories.module').then(m => m.InventoriesModule)
            },
            {
                path: 'sales',
                loadChildren: () => import('./views/sales/sales.module').then(m => m.SalesModule)
            },
            {
                path: 'service',
                loadChildren: () => import('./views/service/service.module').then(m => m.ServiceModule)
            },
            {
                path: 'purchaser-admin',
                loadChildren: () => import('./views/purchaser/purchaser.module').then(m => m.PurchaserModule)
            },
            {
                path: 'package-center',
                loadChildren: () => import('./views/package-center/package-center.module').then(m => m.PackageCenterModule)
            },
            {
                path: 'finance',
                loadChildren: () => import('./views/finance/finance.module').then(m => m.FinanceModule)
            }

        ]
    },
    { path: '**', component: LoginComponent }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
