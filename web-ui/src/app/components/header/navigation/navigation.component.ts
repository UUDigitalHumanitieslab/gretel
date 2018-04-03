import { Component, OnInit } from '@angular/core';
import {Link, mainLinks} from "../../../links";
import {LinkService} from "../../../services/link.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})



export class NavigationComponent implements OnInit {


  constructor(private linkService: LinkService) { }

  links: Link[] = [];

  ngOnInit() {
    this.links = this.linkService.getMainLinks()
  }

}

