import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {StepComponent} from "../step.component";
import {TreebankService} from "../../../services/treebank.service";
import {Treebank, TreebankInfo} from "../../../treebank";
import {TableColumn} from "../../tables/selectable-table/TableColumn";


interface info extends TreebankInfo {
    selected: boolean;
}
@Component({
    selector: 'app-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepComponent implements OnInit {

    items: any[];
    info: { [title: string]: info[] } = {};
    warning: boolean = false;

    mainTreebank: string;
    subTreebanks: string[];
    @Output() onUpdateSelected = new EventEmitter<any>();


    constructor(private treebankService: TreebankService) {
        super();
        this.items = [];
    }

    valid: boolean;


    columns: TableColumn[] = [
        {
            field: "slug",
            header: "Component"
        },
        {
            field: "title",
            header: "Contents"
        },
        {
            field: "nr_sentences",
            header: "Sentences"
        },
        {
            field: "nr_words",
            header: "Words"
        },
    ];

    ngOnInit() {
        this.treebankService.getTreebanks().subscribe((treebank: any) => {
            this.items = treebank;
        })
    }


    treebankChange(e) {
        if (e.target.checked) {
            this.mainTreebank = e.target.value;
            this.getTreebankInfo(this.items.find(t => t.name = e.target.value))
        } else {
            this.mainTreebank = undefined;
        }
        this.updateValidity();
    }

    /**
     * Gets the detailed info of a given treebank
     * @param treebank
     */
    getTreebankInfo(treebank: Treebank) {
        let results = [];

        this.treebankService.getTreebankInfo(treebank).subscribe((info: info[]) => {
                //To keep track if we selected the given subpart of the treebank.
                this.info[treebank.title] = info;
                this.info[treebank.title].forEach(entry => entry.selected = true);
                this.updateSelected();
            }
        )
    }

    updateSelected() {
        this.subTreebanks = this.info[this.mainTreebank].filter(entry => entry.selected).map((entry: any) => entry.title)
        this.onUpdateSelected.emit({
            corpus: this.mainTreebank,
            components: this.subTreebanks
        })
        this.updateValidity()
    }


    /**
     * Checks if there are treebanks selected
     */
    updateValidity() {

        //Why not a oneliner you ask? ts complains about a string type being returned
        if(this.subTreebanks && this.subTreebanks.length != 0 && this.mainTreebank){
            this.valid = true;
        } else {
            this.valid = false
        }
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
