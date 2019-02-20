import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, Inject, LOCALE_ID, OnInit, OnDestroy, } from '@angular/core';

import { TreebankService } from '../../../services/_index';
import { SubTreebank, ComponentGroup, FuzzyNumber } from '../../../treebank';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'grt-sub-treebanks',
    templateUrl: './sub-treebanks.component.html',
    styleUrls: ['./sub-treebanks.component.scss']
})
export class SubTreebanksComponent implements OnChanges {
    public loading: boolean = true;
    public selectedTreebanks: { [name: string]: boolean };
    /**
     * Only show if any sub-treebank has a description available.
     */
    public showDescription: boolean;
    /**
     * All sub-treebanks
     */
    public subTreebanks: SubTreebank[];
    /**
     * Sub-treebanks grouped by their group name, each should then
     * contain one or more of the variants.
     */
    public componentGroups: ComponentGroup[];
    public variants: string[];

    public totalSentenceCount: string;
    public totalWordCount: string;
    public totalSentenceCountByGroup: { [group: string]: string };
    public totalWordCountByGroup: { [group: string]: string };
    public totalSentenceCountByVariant: { [variant: string]: string };
    public totalWordCountByVariant: { [variant: string]: string };

    @Input() treebankName: string;

    @Output() onSelect = new EventEmitter<SubTreebank[]>();

    constructor(private treebankService: TreebankService) {
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

    private updateTotals(subTreebanks: SubTreebank[]) {
        type FuzzyCounts = { [group: string]: FuzzyNumber };
        let totalSentenceCount = new FuzzyNumber(0),
            totalWordCount = new FuzzyNumber(0),
            totalSentenceCountByGroup: FuzzyCounts = {},
            totalWordCountByGroup: FuzzyCounts = {},
            totalSentenceCountByVariant: FuzzyCounts = {},
            totalWordCountByVariant: FuzzyCounts = {};

        for (let group of this.componentGroups) {
            totalSentenceCountByGroup[group.key] = new FuzzyNumber(0);
            totalWordCountByGroup[group.key] = new FuzzyNumber(0);
        }
        for (let variant of this.variants) {
            totalSentenceCountByVariant[variant] = new FuzzyNumber(0);
            totalWordCountByVariant[variant] = new FuzzyNumber(0);
    	}
        for (let subTreebank of subTreebanks) {
            totalSentenceCount.add(subTreebank.sentenceCount);
            totalSentenceCountByGroup[subTreebank.group].add(subTreebank.sentenceCount);
            totalSentenceCountByVariant[subTreebank.variant].add(subTreebank.sentenceCount);

            totalWordCount.add(subTreebank.wordCount);
            totalWordCountByGroup[subTreebank.group].add(subTreebank.wordCount);
            totalWordCountByVariant[subTreebank.variant].add(subTreebank.wordCount);
}

        this.totalSentenceCount = totalSentenceCount.toString();
        this.totalWordCount = totalWordCount.toString();
        function mapFuzzyCounts(counts: FuzzyCounts) {
            let result: { [key: string]: string } = {};
            for (let key of Object.keys(counts)) {
                result[key] = counts[key].toString();
            }
            return result;
        }

        this.totalSentenceCountByGroup = mapFuzzyCounts(totalSentenceCountByGroup);
        this.totalWordCountByGroup = mapFuzzyCounts(totalWordCountByGroup);
        this.totalSentenceCountByVariant = mapFuzzyCounts(totalSentenceCountByVariant);
        this.totalWordCountByVariant = mapFuzzyCounts(totalWordCountByVariant);
    }

    private setSelected(subTreebanks: SubTreebank[]) {
        this.updateTotals(subTreebanks);
        this.onSelect.emit(subTreebanks);
    }

    /**
     * Gets the detailed info of a given treebank
     * @param treebank
     */
    private getSubTreebanks(treebankName: string) {
        this.loading = true;
        this.treebankService.getComponentGroups(treebankName).then((componentGroups) => {
            // To keep track whether we selected the given sub-part of the treebank.
            this.componentGroups = componentGroups.groups;
            this.variants = componentGroups.variants;
            this.subTreebanks = componentGroups.groups.reduce((subTreebanks, group) =>
                subTreebanks.concat(componentGroups.variants.map(variant => group.components[variant])
                    .filter(component => !component.disabled)), []);

            this.showDescription = false;
            let selectedTreebanks: SubTreebanksComponent['selectedTreebanks'] = {};

            for (let subTreebank of this.subTreebanks) {
                selectedTreebanks[subTreebank.component] = true;
            }
            for (let group of componentGroups.groups) {
                if (group.description) {
                    this.showDescription = true;
                }
            }
            this.selectedTreebanks = selectedTreebanks;
            this.setSelected(this.subTreebanks);
            this.loading = false;
        });
    }
}

