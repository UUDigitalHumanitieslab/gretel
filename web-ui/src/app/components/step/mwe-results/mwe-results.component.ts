import { Component } from '@angular/core';
import { ResultsComponent } from '../results/results.component';

@Component({
    selector: 'grt-mwe-results',
    templateUrl: './mwe-results.component.html',
    styleUrls: ['./mwe-results.component.scss'],
    providers: [{ provide: ResultsComponent, useClass: MweResultsComponent }],

})
export class MweResultsComponent extends ResultsComponent {


}
