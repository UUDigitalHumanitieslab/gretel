import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { TreebankService, ConfiguredTreebanks } from '../../../services/_index';
import { TreebankComponent, ComponentGroup, FuzzyNumber, Treebank } from '../../../treebank';

@Component({
    selector: 'grt-sub-treebanks',
    templateUrl: './sub-treebanks.component.html',
    styleUrls: ['./sub-treebanks.component.scss']
})
export class SubTreebanksComponent implements OnChanges, OnInit {
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
    @Input() components: ConfiguredTreebanks[string][string]['components'];
    @Input() componentGroups: ConfiguredTreebanks[string][string]['componentGroups'];
    @Input() variants: ConfiguredTreebanks[string][string]['variants'];

    @Output() select = new EventEmitter<TreebankComponent[]>();

    constructor(private treebankService: TreebankService) {
    }

    ngOnInit() {
        this.showDescription = Object.values(this.components).some(c => !!c.description);
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
            this.componentGroups.map(g => this.components[g.components[variant]]) :
            Object.values(this.components)

        return eligible.every(c => c.selected);
    }

    isTreebankSelected() {
        return this.treebank.selected;
    }

    toggleVariant(variant?: string) {
        if (variant) {
            this.treebankService.toggleVariant(this.treebank.provider, this.treebank.id, variant);
        } else {
            this.treebankService.toggleComponents(this.treebank.provider, this.treebank.id);
        }

        if (!this.treebank.multiOption) {
            return;
        }
    }

    toggleComponent(component: TreebankComponent) {
        this.treebankService.toggleComponent(
            this.treebank.provider,
            this.treebank.id,
            component.id
        );
    }

    toggleGroup(group: ComponentGroup) {
        if (!this.treebank.multiOption && this.variants.length > 1) {
            return;
        }

        this.treebankService.toggleComponentGroup(
            this.treebank.provider,
            this.treebank.id,
            group.key
        );
    }

    private updateTotals() {
        interface FuzzyCounts { [group: string]: FuzzyNumber; }
        const totalSentenceCount = new FuzzyNumber(0);
        const totalWordCount = new FuzzyNumber(0);
        const totalSentenceCountByGroup: FuzzyCounts = {};
        const totalWordCountByGroup: FuzzyCounts = {};
        const totalSentenceCountByVariant: FuzzyCounts = {};
        const totalWordCountByVariant: FuzzyCounts = {};

        if (this.variants && this.componentGroups) {
            for (const group of this.componentGroups) {
                totalSentenceCountByGroup[group.key] = new FuzzyNumber(0);
                totalWordCountByGroup[group.key] = new FuzzyNumber(0);
            }
            for (const variant of this.variants) {
                totalSentenceCountByVariant[variant] = new FuzzyNumber(0);
                totalWordCountByVariant[variant] = new FuzzyNumber(0);
            }
        }
        for (const subTreebank of Object.values(this.components)) {
            totalSentenceCount.add(subTreebank.sentenceCount);
            totalWordCount.add(subTreebank.wordCount);

            if (this.variants && this.componentGroups) {
                totalSentenceCountByGroup[subTreebank.group].add(subTreebank.sentenceCount);
                totalSentenceCountByVariant[subTreebank.variant].add(subTreebank.sentenceCount);

                totalWordCountByGroup[subTreebank.group].add(subTreebank.wordCount);
                totalWordCountByVariant[subTreebank.variant].add(subTreebank.wordCount);
            }
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

