import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, } from '@angular/core';

import { TreebankService } from '../../../services/_index';
import { SubTreebank, ComponentGroup, FuzzyNumber } from '../../../treebank';

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

    ngOnChanges(changes: SimpleChanges) {
        let treebankNameChange = changes["treebankName"];
        if (this.treebankName &&
            treebankNameChange &&
            (treebankNameChange.firstChange || treebankNameChange.currentValue != treebankNameChange.previousValue)) {
            this.getSubTreebanks(this.treebankName);
        }
    }

    changeSelected(group: ComponentGroup, selectedVariant: string = null, event?: Event) {
        let newSelection: { [component: string]: boolean } = {};
        for (let variant of (selectedVariant ? [selectedVariant] : Object.keys(group.components))) {
            const variantComponent = group.components[variant];
            if (!variantComponent.disabled) {
                newSelection[variantComponent.component] = !this.selectedTreebanks[variantComponent.component]
            }
        }
        this.selectedTreebanks = Object.assign(
            {},
            this.selectedTreebanks,
            newSelection);

        if (event) {
            event.preventDefault();
        }

        this.setSelected(
            this.subTreebanks.filter(t => this.selectedTreebanks[t.component]));
    }

    changeAllSelected(event: Event, variant: string = null) {
        event.preventDefault();

        let check = !this.isAllChecked(variant);
        let selected = Object.assign({}, this.selectedTreebanks);
        if (variant) {
            for (let componentGroups of this.componentGroups) {
                let component = componentGroups.components[variant];
                if (component && !component.disabled) {
                    selected[component.component] = check;
                }
            }
        } else {
            for (let subtree of this.subTreebanks) {
                selected[subtree.component] = check;
            }
        }
        this.selectedTreebanks = selected;

        this.setSelected(check ? this.subTreebanks : []);
    }

    isAllChecked(variant: string = null) {
        if (variant) {
            if (!this.componentGroups) {
                return false;
            }
            for (let componentGroups of this.componentGroups) {
                let component = componentGroups.components[variant];
                if (!component.disabled && !this.selectedTreebanks[component.component]) {
                    return false;
                }
            }
            return true;
        }
        if (!this.subTreebanks) {
            return false;
        }
        for (let subtree of this.subTreebanks) {
            if (!this.selectedTreebanks[subtree.component]) {
                return false;
            }
        }
        return true;
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

