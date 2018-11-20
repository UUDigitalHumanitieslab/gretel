import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { StepComponent } from "../step.component";
import { TreebankService } from "../../../services/treebank.service";
import { Treebank, SubTreebank } from "../../../treebank";

@Component({
    selector: 'grt-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepComponent implements OnInit {
    treebanks: Treebank[];
    selectedTreebank: string;
    loading: boolean = false;

    @Input() subTreebanks: string[];

    @Output() mainTreebankChange = new EventEmitter<string>();
    @Output() subTreebanksChange = new EventEmitter<string[]>();

    /**
     * Gets the sub-treebanks whenever the main treebank is set
     * @param treebank
     */
    @Input()
    set mainTreebank(treebank: string) {
        this.selectedTreebank = treebank;
    }

    constructor(private treebankService: TreebankService) {
        super();
        this.treebanks = [];
    }

    valid: boolean;

    ngOnInit() {
        this.treebankService.getTreebanks().then((treebanks) => {
            this.treebanks = treebanks;
        })
    }

    treebankChange(treebank: Treebank) {
        this.selectedTreebank = treebank.name;
        this.mainTreebankChange.emit(this.selectedTreebank);
        this.updateValidity();
    }

    updateSelected(subTreebanks: SubTreebank[]) {
        this.subTreebanks = subTreebanks.map(t => t.component);
        this.mainTreebankChange.emit(this.selectedTreebank);
        this.subTreebanksChange.emit(this.subTreebanks);
        this.updateValidity()
    }

    /**
     * Checks if there are treebanks selected
     */
    updateValidity() {
        this.valid = this.subTreebanks && this.subTreebanks.length && !!this.selectedTreebank;
        this.changeValid.emit(this.valid);
    }

    getValidationMessage() {
        return 'Please select a treebank and the components.';
    }
}
