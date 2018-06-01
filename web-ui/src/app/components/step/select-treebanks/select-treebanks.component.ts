import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { StepComponent } from "../step.component";
import { TreebankService } from "../../../services/treebank.service";
import { Treebank, TreebankInfo } from "../../../treebank";
import { TableColumn } from "../../tables/selectable-table/TableColumn";

interface info extends TreebankInfo {
    selected: boolean;
}
@Component({
    selector: 'grt-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepComponent implements OnInit {
    items: Treebank[];
    info: { [title: string]: info[] } = {};
    warning: boolean = false;
    treebank: string;
    loading: boolean = false;

    @Input() subTreebanks: string[];

    @Output() onUpdateSelected = new EventEmitter<any>();
    @Output() mainTreebankChange = new EventEmitter<string>();
    @Output() subTreebanksChange = new EventEmitter<string[]>();

    /**
     * Gets the sub-treebanks whenever the main treebank is set
     * @param treebank
     */
    @Input()
    set mainTreebank(treebank: string) {
        this.treebank = treebank;
        if (treebank) {
            this.getSubTreebanks({ title: treebank, id: -1 });
        }
    }

    constructor(private treebankService: TreebankService) {
        super();
        this.items = [];
    }

    valid: boolean;

    columns: TableColumn<TreebankInfo>[] = [
        {
            field: "component",
            header: "Component"
        },
        {
            field: "sentenceCount",
            header: "Sentences"
        },
        {
            field: "wordCount",
            header: "Words"
        },
    ];

    ngOnInit() {
        this.treebankService.getTreebanks().then((treebanks) => {
            this.items = treebanks;
        })
    }

    treebankChange(treebank: Treebank) {
        this.treebank = treebank.title;
        this.getSubTreebanks(treebank);
        this.updateValidity();
    }

    /**
     * Gets the detailed info of a given treebank
     * @param treebank
     */
    getSubTreebanks(treebank: Treebank) {
        let results = [];
        this.loading = true;
        this.treebankService.getSubTreebanks(treebank).then((info) => {
            // To keep track whether we selected the given sub-part of the treebank.
            this.info[treebank.title] = info.map(x => Object.assign(x, { selected: true }) as info);
            this.info[treebank.title].forEach(entry => entry.selected = true);
            this.updateSelected();
            this.loading = false;
        });
    }


    updateSelected() {
        this.subTreebanks = this.info[this.treebank].filter(entry => entry.selected).map((entry) => entry.component);
        this.mainTreebankChange.emit(this.treebank);
        this.subTreebanksChange.emit(this.subTreebanks);
        this.updateValidity()
    }


    /**
     * Checks if there are treebanks selected
     */
    updateValidity() {
        this.valid = this.subTreebanks && this.subTreebanks.length && !!this.treebank;
        this.onChangeValid.emit(this.valid);
    }

    /**
     * Shows a warning.
     * This warning should give info why the options that the user selected is not valid.
     */
    showWarning() {
        this.warning = true;
    }
}
