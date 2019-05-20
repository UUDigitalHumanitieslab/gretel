import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'grt-body-header',
    templateUrl: './body-header.component.html',
    styleUrls: ['./body-header.component.scss']
})
export class BodyHeaderComponent implements OnInit {
    @ViewChild('title')
    set title(v: ElementRef<HTMLHeadingElement>) {
        document.title = `${v.nativeElement.innerText} - GrETEL 4`;
    }
    constructor() { }

    ngOnInit() {
    }

}
