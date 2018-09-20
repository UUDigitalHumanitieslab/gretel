import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'grt-documentation-content',
    templateUrl: './documentation-content.component.html',
    styleUrls: ['./documentation-content.component.scss']
})
export class DocumentationContentComponent {

    constructor(activatedRoute: ActivatedRoute) {
        // work around for https://github.com/angular/angular/issues/6595
        activatedRoute.fragment.subscribe((hash) => {
            if (hash) {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    element.className += ' scrolled ';
                    setTimeout(() => {
                        element.className = element.className.replace(/\bscrolled\b/, '').trim();
                    }, 1000);
                }
            } else {
                window.scrollTo(0, 0);
            }
        });
    }
}
