import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
    selector: 'grt-body-header',
    templateUrl: './body-header.component.html',
    styleUrls: ['./body-header.component.scss']
})
export class BodyHeaderComponent implements OnInit {
    @ViewChild('title')
    set title(v: ElementRef<HTMLHeadingElement>) {
        this.titleService.set('title', v.nativeElement.innerText);
    }

    constructor(private titleService: TitleService) { }

    ngOnInit() {
    }

}
