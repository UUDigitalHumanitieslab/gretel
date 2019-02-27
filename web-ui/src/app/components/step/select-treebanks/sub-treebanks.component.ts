import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, Inject, LOCALE_ID, OnInit, OnDestroy, } from '@angular/core';

import { TreebankService, ConfiguredTreebanks } from '../../../services/_index';
import { TreebankComponent, ComponentGroup, FuzzyNumber, Treebank } from '../../../treebank';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'grt-sub-treebanks',
    templateUrl: './sub-treebanks.component.html',
    styleUrls: ['./sub-treebanks.component.scss']
})
export class SubTreebanksComponent implements OnChanges {
    /**
     * Only show if any sub-treebank has a description available.
     */
    public showDescription: boolean;
    public totalSentenceCount: string;
    public totalWordCount: string;
    public totalSentenceCountByGroup: { [group: string]: string };
    public totalWordCountByGroup: { [group: string]: string };
    public totalSentenceCountByVariant: { [variant: string]: string };
    public totalWordCountByVariant: { [variant: string]: string };

    @Input() treebank: Treebank;
    @Input() componentGroups: ConfiguredTreebanks[string][string]['componentGroups'];
    @Input() variants: ConfiguredTreebanks[string][string]['variants'];
    private components: TreebankComponent[];

    @Output() onSelect = new EventEmitter<TreebankComponent[]>();

    constructor(
        private treebankService: TreebankService,
        @Inject(LOCALE_ID) private locale: string
    ) {
        this.components = this.componentGroups.flatMap(g => Object.values(g.components));
        this.showDescription = this.components.some(c => !!c.description);
        this.updateTotals();
    }

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
        return this.treebank.selected && this.components.every(c => c.selected);
    }

    isAllChecked(variant: string) {
        return this.components.every(c => c.variant !== variant || c.selected);
    }

    changeAllSelected(event: Event, variant: string) {
        event.preventDefault();
        const check = !this.isAllChecked(variant);
        this.treebankService.selectComponents(
            this.treebank.provider,
            this.treebank.name,
            this.components
                .filter(c => c.variant === variant)
                .map(c => ({
                    componentId: c.id,
                    selected: check
                }))
        )
    }

    changeSelected(group: ComponentGroup, variant?: string, event?: Event) {
        if (event) {
            event.preventDefault();
        }

        this.treebankService.selectComponents(
            this.treebank.provider,
            this.treebank.name,
            Object.values(group.components)
                .filter(c => variant == null || c.variant === variant)
                .map(c => ({
                    componentId: c.id,
                    selected: !c.selected
                }))
        )
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
        type FuzzyCounts = { [group: string]: FuzzyNumber };
        const totalSentenceCount = new FuzzyNumber(0);
        const totalWordCount = new FuzzyNumber(0);
        const totalSentenceCountByGroup: FuzzyCounts = {};
        const totalWordCountByGroup: FuzzyCounts = {};
        const totalSentenceCountByVariant: FuzzyCounts = {};
        const totalWordCountByVariant: FuzzyCounts = {};

        for (const group of this.componentGroups) {
            totalSentenceCountByGroup[group.key] = new FuzzyNumber(0);
            totalWordCountByGroup[group.key] = new FuzzyNumber(0);
        }
        for (const variant of this.variants) {
            totalSentenceCountByVariant[variant] = new FuzzyNumber(0);
            totalWordCountByVariant[variant] = new FuzzyNumber(0);
    	}
        for (const subTreebank of this.components) {
            totalSentenceCount.add(subTreebank.sentenceCount);
            totalSentenceCountByGroup[subTreebank.group].add(subTreebank.sentenceCount);
            totalSentenceCountByVariant[subTreebank.variant].add(subTreebank.sentenceCount);

            totalWordCount.add(subTreebank.wordCount);
            totalWordCountByGroup[subTreebank.group].add(subTreebank.wordCount);
            totalWordCountByVariant[subTreebank.variant].add(subTreebank.wordCount);
        }

        this.totalSentenceCount = totalSentenceCount.toString(this.locale);
        this.totalWordCount = totalWordCount.toString(this.locale);
        function mapFuzzyCounts(counts: FuzzyCounts) {
            let result: { [key: string]: string } = {};
            for (let key of Object.keys(counts)) {
                result[key] = counts[key].toString(this.locale);
            }
            return result;
        }

        this.totalSentenceCountByGroup = mapFuzzyCounts(totalSentenceCountByGroup);
        this.totalWordCountByGroup = mapFuzzyCounts(totalWordCountByGroup);
        this.totalSentenceCountByVariant = mapFuzzyCounts(totalSentenceCountByVariant);
        this.totalWordCountByVariant = mapFuzzyCounts(totalWordCountByVariant);
    }
}

