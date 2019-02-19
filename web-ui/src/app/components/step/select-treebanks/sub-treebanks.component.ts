import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, Inject, LOCALE_ID, OnInit, OnDestroy, } from '@angular/core';

import { TreebankService } from '../../../services/_index';
import { TreebankComponent, Treebank } from '../../../treebank';
// import { SelectedTreebanksService, SelectedTreebanks } from '../../../services/selected-treebanks.service';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'grt-sub-treebanks',
    templateUrl: './sub-treebanks.component.html',
    styleUrls: ['./sub-treebanks.component.scss']
})
export class SubTreebanksComponent implements OnChanges {
    // private components: TreebankComponent[];
    // private selectedTreebanks: SelectedTreebanks;

    // Caching variables
    /** Only show if any subcomponent has a description available. */
    private showDescription: boolean;
    private totalSentenceCount: string;
    private totalWordCount: string;

    // private readonly subscriptions: Subscription[];

    @Input() treebank: Treebank;
    @Input() components: TreebankComponent[];

    constructor(private treebankService: TreebankService, @Inject(LOCALE_ID) private locale: string) {
        // this.subscriptions = [
        //     this.selectedTreebanksService.selectedTreebanks.subscribe(state => {
        //         this.selectedTreebanks = state;
        //         this.updateTotals();
        //     }),
        // ]
    }

    // ngOnInit() {
    //     this.updateComponents();
    // }

    // ngOnDestroy() {
    //     this.subscriptions.forEach(s => s.unsubscribe());
    // }

    ngOnChanges(/*changes: SimpleChanges*/) {
        this.updateTotals();
    }

    toggleComponent(componentId: string) {
        this.treebankService.toggleComponent(this.treebank.provider, this.treebank.name, componentId);
    }

    toggleAllComponents() {
        this.treebankService.selectAllComponents(this.treebank.provider, this.treebank.name, !this.allComponentsSelected());
    }

    allComponentsSelected() {
        return this.components.every(c => c.selected);
    }

    // TODO use rx, cancel requests in progress?
    // private updateComponents() {
    //     this.treebankService.getComponents(this.provider, this.corpus)
    //     .then(components => {
    //         this.components = components;
    //         this.showDescription = components.some(c => !!c.description);
    //         this.updateTotals();
    //     });
    // }

    private updateTotals() {
        const totalSentenceCount = new FuzzyNumber(0);
        const totalWordCount = new FuzzyNumber(0);

        this.components.filter(c => c.selected)
        .forEach(c => {
            totalSentenceCount.add(c.sentenceCount);
            totalWordCount.add(c.wordCount);
        })

        this.totalSentenceCount = totalSentenceCount.toString(this.locale);
        this.totalWordCount = totalWordCount.toString(this.locale);
        this.showDescription = this.components.some(c => !!c.description);
    }

    formatIfNumber(value: string|number) {
        if (typeof value === 'string') {
            return value;
        }
        return value.toLocaleString(this.locale);
    }
}

export class FuzzyNumber {
    public value = 0;
    public unknown = false;
    constructor(value: number | '?') {
        if (value == '?') {
            this.unknown = true;
        } else {
            this.value = value;
        }
    }

    public add(value: number | '?') {
        if (value == '?') {
            this.unknown = true;
        } else {
            this.value += value;
        }
    }

    public toString(locale: string = navigator.language) {
        if (this.unknown) {
            if (this.value == 0) {
                return '?'
            } else {
                return '≥ ' + this.value.toLocaleString(locale);
            }
        } else {
            return this.value.toLocaleString(locale);
        }
    }
}
