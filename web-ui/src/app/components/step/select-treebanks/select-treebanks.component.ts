import {Component, Input, OnInit} from '@angular/core';
import {StepComponent} from "../step.component";
import {TreebankService} from "../../../services/treebank.service";
import {Treebank, TreebankInfo} from "../../../treebank";
import {TableColumn} from "../../scrollable-table/TableColumn";


interface info extends TreebankInfo{
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


  constructor(private treebankService: TreebankService) {
    super();
    this.items = [];
  }

  valid: boolean = false;


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
      }
    )
  }

  /**
   * Checks if there are treebanks selected
   */
  checkIfValid() {
    //TODO: make correct
    this.isValid.emit(this.valid);
  }

  /**
   * Shows a warning.
   * This warning should give info why the options that the user selected is not valid.
   */
  showWarning() {
    console.log("Warning")
  }


}
