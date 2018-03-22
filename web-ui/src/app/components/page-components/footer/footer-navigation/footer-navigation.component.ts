import { Component, OnInit } from '@angular/core';
import {Link} from "../../../../app-routing/links";
import {LinkService} from "../../../../services/link.service";

@Component({
  selector: 'app-footer-navigation',
  templateUrl: './footer-navigation.component.html',
  styleUrls: ['./footer-navigation.component.scss']
})
export class FooterNavigationComponent implements OnInit {

  constructor(private linkService: LinkService) { }

  links: Link[] = [];

  ngOnInit() {
    this.links = this.linkService.getMainLinks()
  }

}
