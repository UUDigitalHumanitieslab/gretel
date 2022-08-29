/**
 * Component that can be used to cite a paper
 */
import { Component, Input } from '@angular/core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'grt-paper-cite',
    templateUrl: './paper-cite.component.html',
    styleUrls: ['./paper-cite.component.scss']
})
export class PaperCiteComponent {
    faDownload = faDownload;

    @Input() href: string;
}
