import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, } from '@angular/core';

import { TreebankService } from '../../../services/_index';
import { SubTreebank } from '../../../treebank';

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
    public subTreebanks: SubTreebank[];
    public totalSentenceCount: string;
    public totalWordCount: string;

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

    changeSelected(subtree: SubTreebank, event?: Event) {
        this.selectedTreebanks = Object.assign(
            {},
            this.selectedTreebanks,
            {
                [subtree.component]: !this.selectedTreebanks[subtree.component]
            });

        if (event) {
            event.preventDefault();
        }

        this.setSelected(
            this.subTreebanks.filter(t => this.selectedTreebanks[t.component]));
    }

    changeAllSelected(event: Event) {
        event.preventDefault();

        let check = !this.isAllChecked();
        let selected: SubTreebanksComponent['selectedTreebanks'] = {};
        for (let subtree of this.subTreebanks) {
            selected[subtree.component] = check;
        }
        this.selectedTreebanks = selected;

        this.setSelected(check ? this.subTreebanks : []);
    }

    isAllChecked() {
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
        let totalSentenceCount = new FuzzyNumber(0),
            totalWordCount = new FuzzyNumber(0);

        for (let subTreebank of subTreebanks) {
            totalSentenceCount.add(subTreebank.sentenceCount);
            totalWordCount.add(subTreebank.wordCount);
        }

        this.totalSentenceCount = totalSentenceCount.toString();
        this.totalWordCount = totalWordCount.toString();

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
        this.treebankService.getSubTreebanks(treebankName).then((subTreebanks) => {
            // To keep track whether we selected the given sub-part of the treebank.
            this.subTreebanks = subTreebanks;
            this.showDescription = false;
            let selectedTreebanks: SubTreebanksComponent['selectedTreebanks'] = {};
            for (let subTreebank of subTreebanks) {
                selectedTreebanks[subTreebank.component] = true;
                if (subTreebank.description) {
                    this.showDescription = true;
                }
            }
            this.selectedTreebanks = selectedTreebanks;
            this.setSelected(subTreebanks);
            this.loading = false;
        });
    }
}

class FuzzyNumber {
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

    public toString() {
        if (this.unknown) {
            if (this.value == 0) {
                return '?'
            } else {
                return '≥ ' + this.value;
            }
        } else {
            return this.value.toString();
        }
    }
}
