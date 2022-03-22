import { Component, OnInit, TemplateRef, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-page-details',
    templateUrl: './page-details.component.html',
    styleUrls: ['./page-details.component.css']
})
export class PageDetailsComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    apiUrl = environment.API_ENDPOINT;
    pageId = '';
    bookId = '';
    collectionId = '';
    pageDetails: any = {};
    pageTilesArray = [];
    constructor(
        private router: Router,
        public activatedRoute: ActivatedRoute,
        private webService: WebService,
        private toastr: ToastrService,
        protected sanitizer: DomSanitizer,
        private spinnerService: Ng4LoadingSpinnerService,
    ) {
        this.pageId = this.activatedRoute.snapshot.paramMap.get("pageId");
        this.bookId = this.activatedRoute.snapshot.paramMap.get("bookId");
        this.collectionId = this.activatedRoute.snapshot.paramMap.get("collectionId");
    }

    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
    }

    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                }
                else {
                    this.getPageDetails();
                    this.getPageTiles();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    getPageDetails() {
        this.spinnerService.show();
        let url = `purchaser-portal/pages?_id=${this.pageId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.pageDetails = response.result;
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getPageTiles() {
        this.spinnerService.show();
        let url = `purchaser-portal/tiles?pageId=${this.pageId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.pageTilesArray = response.results;
                if (this.pageTilesArray.length > 0) {
                    this.pageTilesArray.forEach(item => {
                        if (item.type == 'VIDEO' && item.url != '') {
                            let url = '';
                            if (item.video_type == 'VIMEO') {
                                url = `https://player.vimeo.com/video/${item.video_id}`;
                            }
                            if (item.video_type == 'YOUTUBE') {
                                url = `https://www.youtube.com/embed/${item.video_id}`;
                            }
                            item.showing_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                        }
                        if (item.custom_bg == 'bvideo') {
                            item.style.showing_url = '';
                            let url = '';
                            if (item.style.video_type == 'VIMEO') {
                                url = `https://player.vimeo.com/video/${item.style.video_id}?autoplay=1&loop=1&autopause=0&muted=1&background=1`;
                            }
                            if (item.style.video_type == 'YOUTUBE') {
                                url = `https://www.youtube.com/embed/${item.style.video_id}?autoplay=1&controls=0&mute=1&showinfo=0`;
                            }
                            item.style.showing_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                        }
                    });
                }
            }
            else {
                this.pageTilesArray = [];
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    goBack() {
        this.router.navigate([`/purchaser-admin/collection-details/${this.bookId}/${this.collectionId}`]);
    }
}
