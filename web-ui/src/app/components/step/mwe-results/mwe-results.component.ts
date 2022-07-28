import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultsComponent } from '../results/results.component';
import { MweQuerySet, MweQuery } from '../../../services/mwe.service';

@Component({
    selector: 'grt-mwe-results',
    templateUrl: './mwe-results.component.html',
    styleUrls: ['./mwe-results.component.scss'],
    providers: [{ provide: ResultsComponent, useClass: MweResultsComponent }],

})
export class MweResultsComponent extends ResultsComponent {
    @Input()
    public canSaveQuery: boolean = true;

    @Input()
    public canonicalForm: string;

    @Input()
    public currentQuery: MweQuery;

    @Input()
    public querySet: MweQuerySet;

    @Output()
    public saveQuery = new EventEmitter<string>();

    @Output()
    public changeQuery = new EventEmitter<MweQuery>();

    isQueryAdjusted() {
        return this.currentQuery.id ?? false;
    }
}
