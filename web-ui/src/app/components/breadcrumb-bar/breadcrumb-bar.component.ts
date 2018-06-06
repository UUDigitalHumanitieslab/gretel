import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


export interface Crumb{
  number: number;
  name: string;
}


@Component({
  selector: 'grt-breadcrumb-bar',
  templateUrl: './breadcrumb-bar.component.html',
  styleUrls: ['./breadcrumb-bar.component.scss']
})
export class BreadcrumbBarComponent {
  @Input() crumbs: Crumb[]= [];
  @Input() currentCrumb: number;
}
