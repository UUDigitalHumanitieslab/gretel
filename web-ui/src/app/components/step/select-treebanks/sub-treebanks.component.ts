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
    /** False after ngOnInit has run */
    private loading = true;

    /** Only show if any sub-treebank has a description available. */
    public showDescription: boolean;
    public showWordCount: boolean;
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

    @Output() select = new EventEmitter<TreebankComponent[]>();

    constructor(private treebankService: TreebankService) {
    }

    ngOnInit() {
        this.components = this.componentGroups.flatMap(g => Object.values(g.components));
        this.showDescription = this.components.some(c => !!c.description);
        this.updateTotals();
        this.loading = false;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.loading) {
            this.updateTotals();
        }
    }

    isEveryComponentSelected(variant?: string) {
        const eligible = variant ?
            this.components.filter(c => !c.disabled && c.variant === variant) :
            this.components.filter(c => !c.disabled);
        return eligible.every(c => c.selected);
    }

    isTreebankSelected() {
        return this.treebank.selected;
    }

    toggleVariant(variant?: string) {
        if (!this.treebank.multiOption) {
            return;
        }

        const eligible = variant ?
            this.components.filter(c => !c.disabled && c.variant === variant) :
            this.components.filter(c => !c.disabled);

        const isVariantSelected = eligible.every(c => c.selected);
        this.treebankService.selectComponents(
            this.treebank.provider,
            this.treebank.name,
            eligible.map(c => ({
                componentId: c.id,
                selected: !isVariantSelected
            }))
        );
    }

    toggleComponent(component: TreebankComponent) {
        this.treebankService.selectComponents(
            this.treebank.provider,
            this.treebank.name,
            [{
                componentId: component.id,
                selected: !component.selected
            }]
        );
    }

    toggleGroup(group: ComponentGroup) {
        if (!this.treebank.multiOption) {
            return;
        }

        const components = Object.values(group.components);
        const isGroupSelected = components.every(c => c.disabled || c.selected);

        this.treebankService.selectComponents(
            this.treebank.provider,
            this.treebank.name,
            components.map(c => ({
                componentId: c.id,
                selected: !isGroupSelected && !c.disabled
            }))
        );
    }

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

        this.totalSentenceCount = totalSentenceCount.toLocaleString();
        this.totalWordCount = totalWordCount.toLocaleString();
        this.showWordCount = !totalWordCount.unknown || totalWordCount.value > 0;
		function mapFuzzyCounts(counts: FuzzyCounts) {
            const result: { [key: string]: string } = {};
            for (const key of Object.keys(counts)) {
                result[key] = counts[key].toLocaleString();
            }
            return result;
        }

        this.totalSentenceCountByGroup = mapFuzzyCounts(totalSentenceCountByGroup);
        this.totalWordCountByGroup = mapFuzzyCounts(totalWordCountByGroup);
        this.totalSentenceCountByVariant = mapFuzzyCounts(totalSentenceCountByVariant);
        this.totalWordCountByVariant = mapFuzzyCounts(totalWordCountByVariant);
    }
}

