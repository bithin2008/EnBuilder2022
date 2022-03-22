import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'projectsTab';
    title: string = '';
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
    ) { }
    ngOnInit(): void {
        if (localStorage.getItem('projectActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('projectActiveTab');
            this.setPageTitle(this.defaultActiveTab);

        } else {
            this.setPageTitle(this.defaultActiveTab);
        }
        this.checkLogin();
    }
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                }
                else {
                    localStorage.setItem("token", response.result.session._id);
                    let firstName = response.result.user.firstName || response.result.user.first_name;
                    let lastName = response.result.user.lastName || response.result.user.last_name;
                    let middleName = '';
                    if (response.result.user.middleName || response.result.user.middle_name) {
                        middleName = response.result.user.middleName || response.result.user.middle_name;
                    }
                    let username = firstName + ' ' + middleName + ' ' + lastName;
                    localStorage.setItem("username", username);
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    doTabFunctions(event) {
        if (event.nextId == 'projectsTab') {
            localStorage.setItem('projectActiveTab', 'projectsTab');
        }
        if (event.nextId == 'subdivisionsTab') {
            localStorage.setItem('projectActiveTab', 'subdivisionsTab');
        }
        this.setPageTitle(localStorage.getItem('projectActiveTab'));
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'projectsTab':
                this.title = 'Projects';
                break;
            case 'subdivisionsTab':
                this.title = 'Subdivisions';
                break;
            default:
                this.title = '';
                break;
        }
    }
}
