import {Component, Input, OnInit} from '@angular/core';
import {StepComponent} from "../step.component";
import {TreebankService} from "../../../services/treebank.service";
import {TreebankInfo} from "../../../treebank";
import {TableColumn} from "../../scrollable-table/TableColumn";

@Component({
  selector: 'app-select-treebanks',
  templateUrl: './select-treebanks.component.html',
  styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepComponent implements OnInit {

  items: any[];
  info: { [title: string]: TreebankInfo[] } = {};


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
      field: "name",
      header: "Contents"
    },
    {
      field: "nrSentences",
      header: "Sentences"
    },
    {
      field: "nrWords",
      header: "Words"
    },
  ];

  ngOnInit() {
    this.treebankService.getTreebanks().subscribe((treebank: any) => {
      this.items.push(treebank);
    })
  }

  getTreebankInfo(item: any) {
    let results = [];
    this.treebankService.getTreebankInfo(item).subscribe((info: TreebankInfo) => {
      //To keep track if we selected the given subpart of the treebank.
      info["selected"] = false;
      results.push(info);

      },
      () => {
      },
      () => {
        this.info[item.title] = results;
        console.log(this.info);

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
