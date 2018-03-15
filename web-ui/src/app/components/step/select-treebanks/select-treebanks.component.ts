import {Component, Input, OnInit} from '@angular/core';
import {StepComponent} from "../step.component";
import {TreebankService} from "../../../services/treebank.service";
import {TreebankInfo} from "../../../treebank";
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

  getTreebankInfo(item: any) {
    let results = [];
    this.treebankService.getTreebankInfo(item).subscribe((info: info[]) => {
      //To keep track if we selected the given subpart of the treebank.
      this.info[item.title] = info;
      this.info[item.title].forEach(entry => entry.selected = true);
      }
    )
  }

  checkIfValid() {
    this.valid = !this.valid;
    this.isValid.emit(this.valid);
  }


  showWarning() {
    console.log("Warning")
  }


}
