import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MweQuerySet, MweQuery } from '../../../services/mwe.service';

@Component({
  selector: 'grt-results-query-menu',
  templateUrl: './query-menu.component.html',
  styleUrls: ['./query-menu.component.scss']
})
export class ResultsQueryMenuComponent {
    protected dropdownActive = false;

    @Input()
    public currentQuery: MweQuery;

    @Input()
    public querySet: MweQuerySet;

    @Output()
    public changeQuery = new EventEmitter<MweQuery>();

    menuSelected(query: MweQuery) {
        this.changeQuery.emit(query);
        this.dropdownActive = false;
        this.currentQuery = query;
    }
}
