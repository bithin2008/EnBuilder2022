import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { navItems } from '../_nav';
@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
  public navItems = navItems;
  private navSource = new BehaviorSubject(navItems);
  currentNav = this.navSource.asObservable();

  constructor() { }

  generateNav(nav) {
    this.navSource.next(nav);
    //console.log(this.currentNav);
  }
}
